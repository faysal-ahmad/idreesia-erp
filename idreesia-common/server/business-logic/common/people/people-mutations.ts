import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  EntityType,
  OperationType,
} from 'meteor/idreesia-common/constants/audit';
import {
  People,
  type PersonInput,
} from 'meteor/idreesia-common/server/collections/common';
import { keys, omitBy } from 'meteor/idreesia-common/utilities/lodash';

import { createAuditLog } from '../audit-logs';
import { removePersonImageFiles } from '../person-images';
import { removeAttachment, removeAttachments } from '../stored-attachments';
import { getChangedPersonValues } from './person-changes';
import { assertCnicNotInUse, assertContactNotInUse } from './person-uniqueness';

type LooseRecord = Record<string, any>;

interface UserRef {
  _id: string;
}

interface PersonAttachmentInput {
  _id: string;
  attachmentId: string;
}

// Audit entries record only that the photo changed - never which file, so
// they hold no ids or keys pointing at stored images.
export const PHOTO_AUDIT_FIELD = 'sharedData.image';
export const PHOTO_AUDIT_VALUE = 'updated';
const PHOTO_FIELDS = [
  'sharedData.imageKey',
  'sharedData.imageThumbnailKey',
];

/** Audit values with any photo fields replaced by a single "updated" entry. */
const toAuditValues = (values: LooseRecord): LooseRecord => {
  const auditValues = omitBy(values, (_value, key) =>
    PHOTO_FIELDS.includes(key)
  );
  if (keys(values).some(key => PHOTO_FIELDS.includes(key))) {
    auditValues[PHOTO_AUDIT_FIELD] = PHOTO_AUDIT_VALUE;
  }
  return auditValues;
};

/*
 * A person's audit entries are split by whose data changed: the shared data
 * (name, contacts, photo, attachments, ...) is logged against the person,
 * karkun data against KARKUN, employee data against EMPLOYEE and visitor data
 * against VISITOR. Each module's audit page then shows only its own changes.
 */
const ROLE_SECTIONS = [
  { entityType: EntityType.KARKUN, subDocument: 'karkunData', flag: 'isKarkun' },
  { entityType: EntityType.EMPLOYEE, subDocument: 'employeeData', flag: 'isEmployee' },
  { entityType: EntityType.VISITOR, subDocument: 'visitorData', flag: 'isVisitor' },
];

// Kept under karkunData, but a person's attachments belong to the person.
const PERSON_FIELDS_IN_ROLE_DATA = ['karkunData.attachmentIds'];

/** The audit entity a changed person field (a dotted path) is logged against. */
export function auditEntityTypeOfPersonField(key: string): string {
  if (PERSON_FIELDS_IN_ROLE_DATA.includes(key)) return EntityType.PERSON;
  const section = ROLE_SECTIONS.find(
    ({ subDocument, flag }) => key === flag || key.startsWith(`${subDocument}.`)
  );
  return section ? section.entityType : EntityType.PERSON;
}

/** Changed values (dotted paths) grouped by the entity they are logged against. */
const groupByAuditEntity = (values: LooseRecord) => {
  const groups: Record<string, LooseRecord> = {};
  Object.entries(values).forEach(([key, value]) => {
    const entityType = auditEntityTypeOfPersonField(key);
    groups[entityType] = { ...groups[entityType], [key]: value };
  });
  return groups;
};

/** A new person's values split into the person's own and each role's. */
const splitNewPersonValues = (values: LooseRecord) => {
  const personValues: LooseRecord = { ...values };
  const roleValues: Record<string, LooseRecord> = {};
  ROLE_SECTIONS.forEach(({ entityType, subDocument, flag }) => {
    const section: LooseRecord = {};
    if (values[flag] !== undefined) section[flag] = values[flag];
    if (values[subDocument] !== undefined) section[subDocument] = values[subDocument];
    delete personValues[flag];
    delete personValues[subDocument];
    if (keys(section).length > 0) roleValues[entityType] = section;
  });
  return { personValues, roleValues };
};

export async function createPerson(values: PersonInput, user: UserRef) {
  return runInTransaction(async () => {
    const { dataSource, sharedData = {} } = values;
    const { cnicNumber, contactNumber1, contactNumber2 } = sharedData;
    if (cnicNumber) await assertCnicNotInUse(cnicNumber);
    if (contactNumber1) await assertContactNotInUse(contactNumber1);
    if (contactNumber2) await assertContactNotInUse(contactNumber2);
    if (!dataSource) {
      throw new Error('Data Source is required to create a person.');
    }

    const date = new Date();
    const valuesToInsert = Object.assign({}, values, {
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });

    const personId = await People.insertAsync(valuesToInsert);
    const { personValues, roleValues } = splitNewPersonValues(values);
    await createAuditLog({
      entityId: personId,
      entityType: EntityType.PERSON,
      operationType: OperationType.CREATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: personValues,
    });
    for (const [entityType, auditValues] of Object.entries(roleValues)) {
      await createAuditLog({
        entityId: personId,
        entityType,
        operationType: OperationType.CREATE,
        operationBy: user._id,
        operationTime: date,
        auditValues,
      });
    }

    return People.findOneAsync(personId);
  });
}

export async function updatePerson(values: PersonInput, user: UserRef) {
  return runInTransaction(async () => {
    const { _id } = values;
    if (!_id) {
      throw new Error('Person id is required.');
    }
    const existingPerson = await People.findOneAsync(_id);
    const changedValues = getChangedPersonValues(values, existingPerson);

    if (keys(changedValues).length === 0) {
      // Nothing actually changed
      return People.findOneAsync(_id);
    }

    const cnicNumber = changedValues['sharedData.cnicNumber'];
    const contactNumber1 = changedValues['sharedData.contactNumber1'];
    const contactNumber2 = changedValues['sharedData.contactNumber2'];
    if (cnicNumber) await assertCnicNotInUse(cnicNumber, _id);
    if (contactNumber1) await assertContactNotInUse(contactNumber1, _id);
    if (contactNumber2) await assertContactNotInUse(contactNumber2, _id);

    const date = new Date();
    const valuesToUpdate = Object.assign({}, changedValues, {
      updatedAt: date,
      updatedBy: user._id,
    });

    await People.updateAsync(_id, { $set: valuesToUpdate });

    const auditGroups = groupByAuditEntity(toAuditValues(changedValues));
    for (const [entityType, auditValues] of Object.entries(auditGroups)) {
      await createAuditLog(
        {
          entityId: _id,
          entityType,
          operationType: OperationType.UPDATE,
          operationBy: user._id,
          operationTime: date,
          auditValues,
        },
        existingPerson || null
      );
    }

    return People.findOneAsync(_id);
  });
}

/** Soft-deletes a person. */
export async function removePerson(_id: string, user: UserRef) {
  return runInTransaction(async () => {
    const date = new Date();
    const result = await People.updateAsync(_id, {
      $set: {
        deletedAt: date,
        deletedBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    await createAuditLog({
      entityId: _id,
      entityType: EntityType.PERSON,
      operationType: OperationType.DELETE,
      operationBy: user._id,
      operationTime: date,
    });

    return result;
  });
}

/** Undoes a soft delete. */
export async function restorePerson(_id: string, user: UserRef) {
  return runInTransaction(async () => {
    const date = new Date();
    const result = await People.updateAsync(_id, {
      $unset: {
        deletedAt: '',
        deletedBy: '',
      },
      $set: {
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    await createAuditLog({
      entityId: _id,
      entityType: EntityType.PERSON,
      operationType: OperationType.UPDATE,
      operationBy: user._id,
      operationTime: date,
    });

    return result;
  });
}

/**
 * Permanently deletes a person, their stored photo files and their karkun
 * attachments.
 */
export async function hardRemovePerson(_id: string, user: UserRef) {
  return runInTransaction(async () => {
    const date = new Date();
    const existingPerson = await People.findOneAsync(_id);
    const result = await People.removeAsync(_id);
    if (existingPerson) {
      await removePersonImageFiles(existingPerson.sharedData);
      await removeAttachments(existingPerson.karkunData?.attachmentIds);
    }

    await createAuditLog({
      entityId: _id,
      entityType: EntityType.PERSON,
      operationType: OperationType.DELETE,
      operationBy: user._id,
      operationTime: date,
    });

    return result;
  });
}

export async function addPersonAttachment(
  { _id, attachmentId }: PersonAttachmentInput,
  user: UserRef
) {
  return runInTransaction(async () => {
    const date = new Date();
    await People.updateAsync(_id, {
      $addToSet: {
        'karkunData.attachmentIds': attachmentId,
      },
      $set: {
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    await createAuditLog({
      entityId: _id,
      entityType: EntityType.PERSON,
      operationType: OperationType.UPDATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: { attachmentId },
    });

    return People.findOneAsync(_id);
  });
}

export async function removePersonAttachment(
  { _id, attachmentId }: PersonAttachmentInput,
  user: UserRef
) {
  return runInTransaction(async () => {
    const date = new Date();
    await People.updateAsync(_id, {
      $pull: {
        'karkunData.attachmentIds': attachmentId,
      },
      $set: {
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    await removeAttachment(attachmentId);

    await createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.PERSON,
        operationType: OperationType.UPDATE,
        operationBy: user._id,
        operationTime: date,
        auditValues: { attachmentId: null },
      },
      {
        attachmentId,
      }
    );

    return People.findOneAsync(_id);
  });
}
