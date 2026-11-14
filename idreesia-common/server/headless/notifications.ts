import { createHash } from 'crypto';

import Notifications, {
  type NotificationDocument,
} from 'meteor/idreesia-common/server/collections/common/notifications';

import { findCommitteeIdForWorkspace } from './committee-lookup';
import type {
  CommitteeNotifier,
  ModuleNotification,
  Notifier,
} from './types';

const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

/** What is stored: the content, and the committee it belongs to. */
type Content = Omit<ModuleNotification, 'workspaceId'>;

const hashContent = (n: Content, committeeId: string) =>
  createHash('sha1')
    .update(
      JSON.stringify([
        committeeId,
        n.entityType,
        n.entityId,
        n.eventType,
        n.eventDetails,
        n.recipientUserId ?? null,
        n.actorUserId ?? null,
        n.data ?? null,
        n.expiresAt?.getTime() ?? null,
      ])
    )
    .digest('hex');

const contentFields = (n: Content, committeeId: string) => ({
  committeeId,
  entityType: n.entityType,
  entityId: n.entityId,
  eventType: n.eventType,
  eventDetails: n.eventDetails,
  ...(n.recipientUserId ? { recipientUserId: n.recipientUserId } : {}),
  ...(n.actorUserId ? { actorUserId: n.actorUserId } : {}),
  ...(n.data ? { data: n.data } : {}),
  ...(n.expiresAt ? { expiresAt: n.expiresAt } : {}),
});

/**
 * Stores notifications for one module, keyed `<module>:<id>`, so modules
 * cannot touch each other's notifications. Notifications belong to a
 * committee; the workspace a module addresses is only used to find it.
 */
const createStore = (moduleName: string) => {
  const keyOf = (id: string) => `${moduleName}:${id}`;

  return {
    async publish(notification: Content, committeeId: string) {
      const _id = keyOf(notification.id);
      const contentHash = hashContent(notification, committeeId);
      const now = new Date();

      const existing = (await Notifications.findOneAsync(_id, {
        fields: { contentHash: 1 },
      })) as Pick<NotificationDocument, 'contentHash'> | undefined;
      if (existing?.contentHash === contentHash) return;

      if (!existing) {
        if (notification.expiresAt && notification.expiresAt <= now) return;
        try {
          await Notifications.insertAsync({
            _id,
            module: moduleName,
            ...contentFields(notification, committeeId),
            readBy: [],
            contentHash,
            createdAt: notification.createdAt,
            updatedAt: now,
          } as NotificationDocument);
          return;
        } catch (error) {
          // Published concurrently: fall through and update it.
          if ((error as { code?: number }).code !== 11000) throw error;
        }
      }

      await Notifications.updateAsync(_id, {
        $set: {
          ...contentFields(notification, committeeId),
          readBy: [],
          contentHash,
          updatedAt: now,
        },
        // Fields the module no longer sends.
        $unset: {
          ...(notification.recipientUserId ? {} : { recipientUserId: 1 }),
          ...(notification.actorUserId ? {} : { actorUserId: 1 }),
          ...(notification.data ? {} : { data: 1 }),
          ...(notification.expiresAt ? {} : { expiresAt: 1 }),
        },
      });
    },

    async retire(id: string) {
      await Notifications.removeAsync(keyOf(id));
    },
  };
};

/**
 * The notifier for one headless module. The ERP, not the module, knows which
 * committee owns a workspace; a notification for a workspace no committee
 * owns has nobody to show it to and is not stored.
 */
export const createNotifier = (moduleName: string): Notifier => {
  const store = createStore(moduleName);
  return {
    async publish({ workspaceId, ...notification }) {
      const committeeId = await findCommitteeIdForWorkspace(
        moduleName,
        workspaceId
      );
      if (committeeId) await store.publish(notification, committeeId);
    },
    retire: store.retire,
  };
};

/**
 * The notifier for a committee feature that is not a headless module (e.g.
 * Members). It names the committee directly.
 */
export const createCommitteeNotifier = (
  moduleName: string
): CommitteeNotifier => {
  const store = createStore(moduleName);
  return {
    publish: ({ committeeId, ...notification }) =>
      store.publish(notification, committeeId),
    retire: store.retire,
  };
};

/** Deletes expired notifications and ones past the retention period. */
export const purgeNotifications = async (): Promise<number> => {
  const now = new Date();
  return Notifications.removeAsync({
    $or: [
      { expiresAt: { $lte: now } },
      { updatedAt: { $lt: new Date(now.getTime() - RETENTION_MS) } },
    ],
  });
};
