import { GraphQLError } from 'graphql';

import {
  AttachmentCategory,
  Permissions,
  type AttachmentCategoryValue,
} from 'meteor/idreesia-common/constants';
import { attachmentCategoryOf } from 'meteor/idreesia-common/server/business-logic/common/stored-attachments';
import {
  Attachments,
  People,
} from 'meteor/idreesia-common/server/collections/common';
import {
  isHrEmployee,
  isHrKarkun,
} from 'meteor/idreesia-common/server/business-logic/hr-common/hr-person-roles';
import {
  IssuanceForms,
  PurchaseForms,
} from 'meteor/idreesia-common/server/collections/inventory';
import {
  hasAnyStorePermission,
  hasStorePermission,
} from 'meteor/idreesia-common/server/business-logic/inventory/store-access';
import {
  hasOnePermission,
  isSuperAdmin,
} from 'meteor/idreesia-common/server/graphql-api/security';

/** The signed-in user, as the GraphQL context and the REST routes carry them. */
export interface AttachmentUser {
  _id?: string;
  username?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
  permissions?: string[];
  groups?: string[];
}

/*
 * Attachments carry no owner. What one belongs to is the category it was
 * uploaded under (read from its file key), and these are the permissions of
 * the feature behind each category. The permissions of a purchase or issuance
 * form's attachment are store permissions: they are held on the form's
 * physical store (`store: true`), not globally. A profile attachment belongs
 * to a person (`person: true`): who may use it depends on whether that person
 * is a karkun or an employee (PROFILE_ROLE_PERMISSIONS); the lists here are
 * only for uploading one, before it is on anybody.
 */
const CATEGORY_PERMISSIONS: Record<
  AttachmentCategoryValue,
  { view: string[]; manage: string[]; store?: boolean; person?: boolean }
> = {
  [AttachmentCategory.PURCHASE_FORM]: {
    store: true,
    view: [
      Permissions.IN_VIEW_PURCHASE_FORMS,
      Permissions.IN_MANAGE_PURCHASE_FORMS,
      Permissions.IN_APPROVE_PURCHASE_FORMS,
    ],
    manage: [Permissions.IN_MANAGE_PURCHASE_FORMS],
  },
  [AttachmentCategory.ISSUANCE_FORM]: {
    store: true,
    view: [
      Permissions.IN_VIEW_ISSUANCE_FORMS,
      Permissions.IN_MANAGE_ISSUANCE_FORMS,
      Permissions.IN_APPROVE_ISSUANCE_FORMS,
    ],
    manage: [Permissions.IN_MANAGE_ISSUANCE_FORMS],
  },
  [AttachmentCategory.PROFILE]: {
    person: true,
    view: [
      Permissions.HR_VIEW_KARKUNS,
      Permissions.HR_MANAGE_KARKUNS,
      Permissions.HR_VIEW_EMPLOYEES,
      Permissions.HR_MANAGE_EMPLOYEES,
    ],
    manage: [Permissions.HR_MANAGE_KARKUNS, Permissions.HR_MANAGE_EMPLOYEES],
  },
};

/**
 * Who may use a profile attachment that is on a person: the karkun
 * permissions when the person is a karkun, the employee permissions when they
 * are an employee (either, for someone who is both).
 */
const PROFILE_ROLE_PERMISSIONS = {
  karkun: {
    view: [Permissions.HR_VIEW_KARKUNS, Permissions.HR_MANAGE_KARKUNS],
    manage: [Permissions.HR_MANAGE_KARKUNS],
  },
  employee: {
    view: [Permissions.HR_VIEW_EMPLOYEES, Permissions.HR_MANAGE_EMPLOYEES],
    manage: [Permissions.HR_MANAGE_EMPLOYEES],
  },
};

const forbidden = () =>
  new GraphQLError('You do not have access to this attachment.', {
    extensions: { code: 'FORBIDDEN' },
  });

/**
 * Whether the user may add files of this category. For the form categories the
 * form is not saved yet, so holding the manage permission on any store is
 * enough.
 */
export const canUploadAttachment = async (
  user: AttachmentUser | null | undefined,
  category: AttachmentCategoryValue
): Promise<boolean> => {
  const { manage, store } = CATEGORY_PERMISSIONS[category];
  return store
    ? hasAnyStorePermission(user, manage)
    : hasOnePermission(user, manage);
};

/** The physical store of the form that holds the attachment, if one does. */
const findHoldingFormStore = async (
  category: AttachmentCategoryValue,
  attachmentId: string
) => {
  if (category === AttachmentCategory.PROFILE) return undefined;
  const forms =
    category === AttachmentCategory.PURCHASE_FORM ? PurchaseForms : IssuanceForms;
  const form = await forms.findOneAsync(
    { attachmentIds: attachmentId },
    { fields: { physicalStoreId: 1 } }
  );
  return form ? { physicalStoreId: form.physicalStoreId as string } : null;
};

/**
 * The permissions that open a profile attachment, from the person holding it;
 * undefined when it is on nobody yet.
 */
const findProfileAttachmentPermissions = async (
  attachmentId: string,
  action: 'view' | 'manage'
) => {
  const person = await People.findOneAsync(
    { 'karkunData.attachmentIds': attachmentId },
    { fields: { isKarkun: 1, isEmployee: 1, employeeData: 1 } }
  );
  if (!person) return undefined;
  return [
    ...(isHrKarkun(person) ? PROFILE_ROLE_PERMISSIONS.karkun[action] : []),
    ...(isHrEmployee(person) ? PROFILE_ROLE_PERMISSIONS.employee[action] : []),
  ];
};

const assertCanUse = async (
  user: AttachmentUser | null | undefined,
  attachmentId: string,
  action: 'view' | 'manage'
) => {
  const attachment = await Attachments.findOneAsync(attachmentId);
  if (!attachment) {
    throw new GraphQLError('Attachment not found.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }

  const category = attachmentCategoryOf(attachment.fileKey);
  if (!category) throw forbidden();
  const permissions = CATEGORY_PERMISSIONS[category][action];
  const uploaded = !!user?._id && attachment.createdBy === user._id;

  if (CATEGORY_PERMISSIONS[category].person) {
    const personPermissions = await findProfileAttachmentPermissions(
      attachmentId,
      action
    );
    if (personPermissions) {
      // On a person: whoever holds that person's karkun or employee permission.
      if (!hasOnePermission(user, personPermissions)) throw forbidden();
    } else if (
      // On nobody yet: only the uploader (and a super-admin).
      !hasOnePermission(user, CATEGORY_PERMISSIONS[category].manage) ||
      (!uploaded && !isSuperAdmin(user))
    ) {
      throw forbidden();
    }
    return attachment;
  }

  if (!CATEGORY_PERMISSIONS[category].store) {
    if (!hasOnePermission(user, permissions)) throw forbidden();
    return attachment;
  }

  const store = await findHoldingFormStore(category, attachmentId);
  if (store) {
    // Attached to a form: whoever holds the permission on that form's store.
    if (!(await hasStorePermission(user, store.physicalStoreId, permissions))) {
      throw forbidden();
    }
  } else if (
    // Not attached to any form yet: only the uploader (and a super-admin),
    // who must hold the permission on some store.
    !(await hasAnyStorePermission(user, permissions)) ||
    (!uploaded && !isSuperAdmin(user))
  ) {
    throw forbidden();
  }

  return attachment;
};

/** The attachment, if the user may open it. */
export const assertCanViewAttachment = (
  user: AttachmentUser | null | undefined,
  attachmentId: string
) => assertCanUse(user, attachmentId, 'view');

/** The attachment, if the user may rename or re-describe it. */
export const assertCanManageAttachment = (
  user: AttachmentUser | null | undefined,
  attachmentId: string
) => assertCanUse(user, attachmentId, 'manage');
