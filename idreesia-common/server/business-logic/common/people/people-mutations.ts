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

export async function createPerson(values: PersonInput, user: UserRef) {
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
  await createAuditLog({
    entityId: personId,
    entityType: EntityType.PERSON,
    operationType: OperationType.CREATE,
    operationBy: user._id,
    operationTime: date,
    auditValues: values,
  });

  return People.findOneAsync(personId);
}

export async function updatePerson(values: PersonInput, user: UserRef) {
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

  await createAuditLog(
    {
      entityId: _id,
      entityType: EntityType.PERSON,
      operationType: OperationType.UPDATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: toAuditValues(changedValues),
    },
    existingPerson || null
  );

  return People.findOneAsync(_id);
}

/** Soft-deletes a person. */
export async function removePerson(_id: string, user: UserRef) {
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
}

/** Undoes a soft delete. */
export async function restorePerson(_id: string, user: UserRef) {
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
}

/**
 * Permanently deletes a person, their stored photo files and their karkun
 * attachments.
 */
export async function hardRemovePerson(_id: string, user: UserRef) {
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
}

export async function addPersonAttachment(
  { _id, attachmentId }: PersonAttachmentInput,
  user: UserRef
) {
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
}

export async function removePersonAttachment(
  { _id, attachmentId }: PersonAttachmentInput,
  user: UserRef
) {
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
}
