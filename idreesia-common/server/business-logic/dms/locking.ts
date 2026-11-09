import {
  DMS_DEFAULT_LOCK_MINUTES,
  DMS_MAX_LOCK_MINUTES,
  DmsAction,
  DmsEntityType,
} from 'meteor/idreesia-common/constants/dms';
import {
  DmsDocuments,
  type DmsDocumentDocument,
  type DmsDocumentLock,
} from 'meteor/idreesia-common/server/collections/dms';

import { logActivity } from './activity';
import { dmsError } from './errors';
import {
  diagnoseDocumentWriteFailure,
  isLockActive,
  lockedError,
  lockFreeSelector,
  requireDocument,
  requireUserId,
} from './internal';
import {
  notifyForceUnlocked,
  retireLockExpiring,
} from './notifications';
import { uploadNewVersion, type NewVersionInput } from './versions';

export interface CheckOutOptions {
  /**
   * How long the lock lasts: up to DMS_MAX_LOCK_MINUTES (one week), which is
   * also the default. Every lock expires; there are no open-ended locks.
   */
  expiresInMinutes?: number;
  note?: string;
}

/**
 * Checks a document out to the user: until it is checked in (or the lock
 * expires, or is force-unlocked), no one else can change it. A lock lasts at
 * most a week. Checking out a document the user already holds renews the
 * lock.
 */
export async function checkOutDocument(
  documentId: string,
  userId: string,
  { expiresInMinutes = DMS_DEFAULT_LOCK_MINUTES, note }: CheckOutOptions = {}
): Promise<DmsDocumentDocument> {
  requireUserId(userId);
  if (!Number.isFinite(expiresInMinutes) || expiresInMinutes <= 0) {
    throw dmsError('BAD_USER_INPUT', 'expiresInMinutes must be positive');
  }
  if (expiresInMinutes > DMS_MAX_LOCK_MINUTES) {
    throw dmsError(
      'BAD_USER_INPUT',
      `A lock can last at most ${DMS_MAX_LOCK_MINUTES} minutes (7 days)`
    );
  }
  const document = await requireDocument(documentId);

  const now = new Date();
  const lock: DmsDocumentLock = {
    userId,
    lockedAt: now,
    expiresAt: new Date(now.getTime() + expiresInMinutes * 60000),
    ...(note?.trim() ? { note: note.trim() } : {}),
  };
  const updated = await DmsDocuments.updateAsync(
    { _id: documentId, trashed: false, ...lockFreeSelector(userId, now) },
    { $set: { lock } }
  );
  if (!updated) throw await diagnoseDocumentWriteFailure(documentId, userId);

  await logActivity({
    workspaceId: document.workspaceId,
    entityType: DmsEntityType.DOCUMENT,
    entityId: documentId,
    documentId,
    action: DmsAction.DOCUMENT_CHECKED_OUT,
    userId,
    details: { expiresAt: lock.expiresAt },
  });
  // A renewed lock gets a new "expires soon" warning of its own.
  if (document.lock) await retireLockExpiring(documentId, document.lock.lockedAt);
  return requireDocument(documentId);
}

/**
 * Releases the user's lock, optionally uploading a new version first. Only
 * the lock holder can check a document in.
 */
export async function checkInDocument(
  documentId: string,
  userId: string,
  { newVersion }: { newVersion?: NewVersionInput } = {}
): Promise<DmsDocumentDocument> {
  requireUserId(userId);
  const document = await requireDocument(documentId);
  if (!document.lock) {
    throw dmsError('CONFLICT', `"${document.name}" is not checked out`);
  }
  if (document.lock.userId !== userId) {
    if (isLockActive(document.lock)) throw lockedError(document);
    throw dmsError(
      'CONFLICT',
      `"${document.name}" is not checked out by this user`
    );
  }

  if (newVersion) await uploadNewVersion(documentId, newVersion, userId);

  const released = await DmsDocuments.updateAsync(
    { _id: documentId, 'lock.userId': userId },
    { $unset: { lock: 1 } }
  );
  if (!released) {
    throw dmsError('CONFLICT', 'The lock was released by another request');
  }

  await logActivity({
    workspaceId: document.workspaceId,
    entityType: DmsEntityType.DOCUMENT,
    entityId: documentId,
    documentId,
    action: DmsAction.DOCUMENT_CHECKED_IN,
    userId,
    details: { withNewVersion: !!newVersion },
  });
  await retireLockExpiring(documentId, document.lock.lockedAt);
  return requireDocument(documentId);
}

/**
 * Removes anyone's lock on a document. The module doesn't decide who may do
 * this - callers must restrict it (e.g. to workspace managers).
 */
export async function forceUnlockDocument(
  documentId: string,
  userId: string
): Promise<DmsDocumentDocument> {
  requireUserId(userId);
  const document = await requireDocument(documentId, { includeTrashed: true });
  if (!document.lock) return document;

  await DmsDocuments.updateAsync(documentId, { $unset: { lock: 1 } });
  await logActivity({
    workspaceId: document.workspaceId,
    entityType: DmsEntityType.DOCUMENT,
    entityId: documentId,
    documentId,
    action: DmsAction.DOCUMENT_FORCE_UNLOCKED,
    userId,
    details: {
      previousHolder: document.lock.userId,
      lockedAt: document.lock.lockedAt,
    },
  });
  await notifyForceUnlocked({ ...document, lock: document.lock }, userId);
  await retireLockExpiring(documentId, document.lock.lockedAt);
  return requireDocument(documentId, { includeTrashed: true });
}

export interface LockStatus {
  isLocked: boolean;
  /** Locked by someone other than the asking user. */
  isLockedByOther: boolean;
  lock?: DmsDocumentLock;
}

export async function getLockStatus(
  documentId: string,
  userId: string
): Promise<LockStatus> {
  requireUserId(userId);
  const document = await requireDocument(documentId, { includeTrashed: true });
  if (!isLockActive(document.lock)) {
    return { isLocked: false, isLockedByOther: false };
  }
  return {
    isLocked: true,
    isLockedByOther: document.lock.userId !== userId,
    lock: document.lock,
  };
}
