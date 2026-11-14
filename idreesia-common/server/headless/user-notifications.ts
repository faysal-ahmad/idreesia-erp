import Notifications, {
  type NotificationDocument,
} from 'meteor/idreesia-common/server/collections/common/notifications';

export interface UserNotification extends NotificationDocument {
  isRead: boolean;
}

/**
 * Where a user's notifications can come from: the modules enabled on the
 * committees they belong to.
 */
export type NotificationScope = { committeeId: string; module: string }[];

// Notifications a user can see in the given scope: addressed to them or to
// everyone, not expired, and not caused by themselves.
const visibleTo = (userId: string, scope: NotificationScope) => ({
  $and: [
    { $or: scope.map(({ committeeId, module }) => ({ committeeId, module })) },
    {
      $or: [
        { recipientUserId: userId },
        { recipientUserId: { $exists: false } },
      ],
    },
    { $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }] },
    { actorUserId: { $ne: userId } },
  ],
});

/** The user's notifications, most recently changed first. */
export const getUserNotifications = async (
  userId: string,
  scope: NotificationScope,
  { limit = 100, skip = 0 }: { limit?: number; skip?: number } = {}
): Promise<UserNotification[]> => {
  if (scope.length === 0) return [];
  const docs = (await Notifications.find(visibleTo(userId, scope), {
    // _id breaks ties, so pages (skip) never overlap.
    sort: { updatedAt: -1, _id: 1 },
    limit,
    ...(skip ? { skip } : {}),
  }).fetchAsync()) as NotificationDocument[];
  return docs.map(doc => ({ ...doc, isRead: doc.readBy.includes(userId) }));
};

/** Records that the user has read these notifications (those they can see). */
export const markNotificationsRead = async (
  userId: string,
  scope: NotificationScope,
  ids: string[]
): Promise<true> => {
  if (scope.length === 0 || ids.length === 0) return true;
  await Notifications.updateAsync(
    { ...visibleTo(userId, scope), _id: { $in: ids } },
    { $addToSet: { readBy: userId } },
    { multi: true }
  );
  return true;
};

/** How many of the user's visible notifications they have not read. */
export const countUnreadNotifications = async (
  userId: string,
  scope: NotificationScope
): Promise<number> => {
  if (scope.length === 0) return 0;
  return Notifications.find({
    ...visibleTo(userId, scope),
    readBy: { $ne: userId },
  }).countAsync();
};

/** Unread notifications of one module of one committee. */
export interface UnreadCount {
  committeeId: string;
  module: string;
  count: number;
}

/** The user's unread notifications, counted per committee and module. */
export const countUnreadNotificationsByCommittee = async (
  userId: string,
  scope: NotificationScope
): Promise<UnreadCount[]> => {
  if (scope.length === 0) return [];
  const rows = await Notifications.aggregate<{
    _id: { committeeId: string; module: string };
    count: number;
  }>([
    { $match: { ...visibleTo(userId, scope), readBy: { $ne: userId } } },
    {
      $group: {
        _id: { committeeId: '$committeeId', module: '$module' },
        count: { $sum: 1 },
      },
    },
  ]);
  return rows.map(row => ({ ...row._id, count: row.count }));
};
