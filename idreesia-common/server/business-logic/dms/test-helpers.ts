import DmsDocuments from 'meteor/idreesia-common/server/collections/dms/documents';
import Committees from 'meteor/idreesia-common/server/collections/hr/committees';
import Notifications from 'meteor/idreesia-common/server/collections/common/notifications';
import type {
  DmsDocumentDocument,
  DmsDocumentLock,
} from 'meteor/idreesia-common/server/collections/dms';

import { createWorkspace } from './workspaces';

export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;
export const NOW = new Date('2026-06-01T12:00:00Z');

/** The committee that owns a test workspace (see `createTestWorkspace`). */
export const committeeOf = (workspaceId: string) => `committee-${workspaceId}`;

/** A DMS workspace, owned by a committee (notifications belong to committees). */
export const createTestWorkspace = async () => {
  const { _id } = await createWorkspace({ name: 'Test workspace' }, 'admin');
  await Committees.insertAsync({
    _id: committeeOf(_id),
    name: 'Test committee',
    members: [],
    dmsWorkspaceId: _id,
  } as any);
  return _id;
};

let counter = 0;

/** A live document, optionally locked. */
export const createTestDocument = async (
  workspaceId: string,
  overrides: Partial<DmsDocumentDocument> & { lock?: DmsDocumentLock } = {}
): Promise<DmsDocumentDocument> => {
  counter += 1;
  const name = overrides.name ?? `Document ${counter}`;
  const _id = overrides._id ?? `doc${counter}`;
  await DmsDocuments.insertAsync({
    _id,
    workspaceId,
    name,
    nameLower: name.toLowerCase(),
    tags: [],
    versionCount: 0,
    trashed: false,
    createdAt: NOW,
    createdBy: 'admin',
    updatedAt: NOW,
    updatedBy: 'admin',
    ...overrides,
  } as DmsDocumentDocument);
  return (await DmsDocuments.findOneAsync(_id))!;
};

/** A lock held by `userId` from `lockedAt` for `minutes`. */
export const lockOf = (
  userId: string,
  lockedAt: Date,
  minutes: number
): DmsDocumentLock => ({
  userId,
  lockedAt,
  expiresAt: new Date(lockedAt.getTime() + minutes * 60 * 1000),
});

export const dmsNotifications = async () =>
  (await Notifications.find({ module: 'dms' }).fetchAsync()) as any[];

export const dmsNotification = async (id: string) =>
  (await Notifications.findOneAsync(`dms:${id}`)) as any;
