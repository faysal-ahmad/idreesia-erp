import {
  DMS_MODULE,
  DmsAction,
} from 'meteor/idreesia-common/constants/dms';
import {
  DmsDocuments,
  type DmsDocumentDocument,
  type DmsDocumentLock,
} from 'meteor/idreesia-common/server/collections/dms';
import {
  createNotifier,
  type ModuleNotification,
} from 'meteor/idreesia-common/server/headless';

/**
 * The notifications the DMS publishes:
 * - a lock was force-unlocked (to its holder);
 * - a long lock is about to expire (to its holder; from a scheduled job);
 * - a document was added, or got a new version (to everyone in the workspace).
 *
 * Publishing is best effort: a failure is logged and never fails the DMS
 * operation that caused it.
 */

const HOUR_MS = 60 * 60 * 1000;
/** A lock this close to expiring (and longer than this) is worth a warning. */
export const LOCK_EXPIRING_WINDOW_MS = 24 * HOUR_MS;

const notifier = createNotifier(DMS_MODULE);

type NamedDocument = Pick<DmsDocumentDocument, '_id' | 'workspaceId' | 'name'>;

export const lockExpiringId = (documentId: string, lockedAt: Date) =>
  `lock-expiring:${documentId}:${lockedAt.getTime()}`;

/** Logs a failed publish instead of failing the operation that caused it. */
const bestEffort = async (description: string, action: () => Promise<void>) => {
  try {
    await action();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`DMS: could not ${description}:`, error);
  }
};

// ----------------------------------------------------------------------------
// Pure builders and rules
// ----------------------------------------------------------------------------

/** #1: the holder's lock was removed by someone else. Null if it was theirs. */
export const buildForceUnlockedNotification = (
  document: NamedDocument & { lock: DmsDocumentLock },
  forcedByUserId: string,
  now = new Date()
): ModuleNotification | null => {
  if (document.lock.userId === forcedByUserId) return null;
  return {
    id: `force-unlocked:${document._id}:${document.lock.lockedAt.getTime()}`,
    workspaceId: document.workspaceId,
    entityType: 'document',
    entityId: document._id,
    eventType: DmsAction.DOCUMENT_FORCE_UNLOCKED,
    eventDetails: `Your lock on "${document.name}" was removed by someone else.`,
    createdAt: now,
    recipientUserId: document.lock.userId,
    actorUserId: forcedByUserId,
  };
};

/** #4: a document was added to the workspace. For everyone in it. */
export const buildDocumentAddedNotification = (
  document: NamedDocument,
  userId: string,
  now = new Date()
): ModuleNotification => ({
  id: `document-added:${document._id}`,
  workspaceId: document.workspaceId,
  entityType: 'document',
  entityId: document._id,
  eventType: DmsAction.DOCUMENT_CREATED,
  eventDetails: `New document "${document.name}".`,
  createdAt: now,
  actorUserId: userId,
});

/**
 * #5: a document got a new version. For everyone in the workspace. One id per
 * document, so several versions are one notification that is updated. Null
 * for version 1, which is the document being added (#4).
 */
export const buildVersionAddedNotification = (
  document: NamedDocument,
  versionNumber: number | undefined,
  userId: string,
  now = new Date()
): ModuleNotification | null => {
  if (!versionNumber || versionNumber <= 1) return null;
  return {
    id: `version-added:${document._id}`,
    workspaceId: document.workspaceId,
    entityType: 'document',
    entityId: document._id,
    eventType: DmsAction.VERSION_ADDED,
    eventDetails: `New version of "${document.name}" (version ${versionNumber}).`,
    data: { versionNumber },
    createdAt: now,
    actorUserId: userId,
  };
};

/**
 * Whether a lock deserves an "expires soon" warning: it is active, ends
 * within 24 hours, and was a long lock (more than 24 hours), so short locks
 * don't produce noise.
 */
export const isLockExpiringSoon = (lock: DmsDocumentLock, now = new Date()) =>
  lock.expiresAt > now &&
  lock.expiresAt.getTime() - now.getTime() <= LOCK_EXPIRING_WINDOW_MS &&
  lock.expiresAt.getTime() - lock.lockedAt.getTime() > LOCK_EXPIRING_WINDOW_MS;

/** #2: the holder's long lock is about to expire. */
export const buildLockExpiringNotification = (
  document: NamedDocument & { lock: DmsDocumentLock },
  now = new Date()
): ModuleNotification => ({
  id: lockExpiringId(document._id, document.lock.lockedAt),
  workspaceId: document.workspaceId,
  entityType: 'document',
  entityId: document._id,
  eventType: 'lock-expiring',
  eventDetails: `Your lock on "${document.name}" expires soon.`,
  data: { expiresAt: document.lock.expiresAt.toISOString() },
  createdAt: now,
  recipientUserId: document.lock.userId,
  // Gone when the lock lapses.
  expiresAt: document.lock.expiresAt,
});

// ----------------------------------------------------------------------------
// Publishing (best effort)
// ----------------------------------------------------------------------------

export const notifyForceUnlocked = (
  document: NamedDocument & { lock: DmsDocumentLock },
  forcedByUserId: string
) =>
  bestEffort('publish the force-unlock notification', async () => {
    const notification = buildForceUnlockedNotification(
      document,
      forcedByUserId
    );
    if (notification) await notifier.publish(notification);
  });

export const notifyDocumentAdded = (document: NamedDocument, userId: string) =>
  bestEffort('publish the new document notification', () =>
    notifier.publish(buildDocumentAddedNotification(document, userId))
  );

export const notifyVersionAdded = (
  document: NamedDocument,
  versionNumber: number | undefined,
  userId: string
) =>
  bestEffort('publish the new version notification', async () => {
    const notification = buildVersionAddedNotification(
      document,
      versionNumber,
      userId
    );
    if (notification) await notifier.publish(notification);
  });

/** Withdraws a pending "expires soon" warning (lock ended or was renewed). */
export const retireLockExpiring = (documentId: string, lockedAt: Date) =>
  bestEffort('retire the lock expiring notification', () =>
    notifier.retire(lockExpiringId(documentId, lockedAt))
  );

/**
 * Publishes "expires soon" for every long lock that is about to expire.
 * Run on a schedule; publishing unchanged content is a no-op, so repeated
 * runs are safe. Returns how many documents were considered.
 */
export const publishExpiringLockNotifications = async (
  now = new Date()
): Promise<number> => {
  const candidates = (await DmsDocuments.find({
    trashed: false,
    'lock.expiresAt': {
      $gt: now,
      $lte: new Date(now.getTime() + LOCK_EXPIRING_WINDOW_MS),
    },
  }).fetchAsync()) as DmsDocumentDocument[];

  const expiring = candidates.filter(
    (document): document is DmsDocumentDocument & { lock: DmsDocumentLock } =>
      !!document.lock && isLockExpiringSoon(document.lock, now)
  );
  for (const document of expiring) {
    await bestEffort('publish the lock expiring notification', () =>
      notifier.publish(buildLockExpiringNotification(document, now))
    );
  }
  return expiring.length;
};
