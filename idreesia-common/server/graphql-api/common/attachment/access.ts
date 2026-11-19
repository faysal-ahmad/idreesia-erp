import { GraphQLError } from 'graphql';

import {
  AttachmentCategory,
  Permissions,
  type AttachmentCategoryValue,
} from 'meteor/idreesia-common/constants';
import { attachmentCategoryOf } from 'meteor/idreesia-common/server/business-logic/common/stored-attachments';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import {
  IssuanceForms,
  PurchaseForms,
} from 'meteor/idreesia-common/server/collections/inventory';
import {
  hasInstanceAccess,
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
  instances?: string[];
}

/*
 * Attachments carry no owner. What one belongs to is the category it was
 * uploaded under (read from its file key), and these are the permissions of
 * the feature behind each category. Seeing a purchase or issuance form's
 * attachment also needs access to the form's physical store.
 */
const CATEGORY_PERMISSIONS: Record<
  AttachmentCategoryValue,
  { view: string[]; manage: string[] }
> = {
  [AttachmentCategory.PURCHASE_FORM]: {
    view: [
      Permissions.IN_VIEW_PURCHASE_FORMS,
      Permissions.IN_MANAGE_PURCHASE_FORMS,
      Permissions.IN_APPROVE_PURCHASE_FORMS,
    ],
    manage: [Permissions.IN_MANAGE_PURCHASE_FORMS],
  },
  [AttachmentCategory.ISSUANCE_FORM]: {
    view: [
      Permissions.IN_VIEW_ISSUANCE_FORMS,
      Permissions.IN_MANAGE_ISSUANCE_FORMS,
      Permissions.IN_APPROVE_ISSUANCE_FORMS,
    ],
    manage: [Permissions.IN_MANAGE_ISSUANCE_FORMS],
  },
  [AttachmentCategory.PROFILE]: {
    view: [
      Permissions.HR_VIEW_KARKUNS,
      Permissions.HR_MANAGE_KARKUNS,
      Permissions.HR_VIEW_EMPLOYEES,
      Permissions.HR_MANAGE_EMPLOYEES,
    ],
    manage: [Permissions.HR_MANAGE_KARKUNS, Permissions.HR_MANAGE_EMPLOYEES],
  },
};

const forbidden = () =>
  new GraphQLError('You do not have access to this attachment.', {
    extensions: { code: 'FORBIDDEN' },
  });

/** Whether the user may add files of this category. */
export const canUploadAttachment = (
  user: AttachmentUser | null | undefined,
  category: AttachmentCategoryValue
) => hasOnePermission(user, CATEGORY_PERMISSIONS[category].manage);

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
  if (
    !category ||
    !hasOnePermission(user, CATEGORY_PERMISSIONS[category][action])
  ) {
    throw forbidden();
  }

  const store = await findHoldingFormStore(category, attachmentId);
  if (store) {
    // Attached to a form: whoever may see that form's store.
    if (!hasInstanceAccess(user, store.physicalStoreId)) throw forbidden();
  } else if (store === null) {
    // Not attached to any form yet: only the uploader (and a super-admin).
    const uploaded = !!user?._id && attachment.createdBy === user._id;
    if (!uploaded && !isSuperAdmin(user)) throw forbidden();
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
