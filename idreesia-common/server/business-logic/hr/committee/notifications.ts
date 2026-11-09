import {
  countUnreadNotifications,
  countUnreadNotificationsByCommittee,
  getUserNotifications,
  markNotificationsRead,
} from 'meteor/idreesia-common/server/headless';

import { getPersonNotificationScope } from './workspaces';

/** The logged-in user, as far as notifications are concerned. */
export interface NotificationUser {
  _id?: string;
  personId?: string;
}

export interface MyNotification {
  _id: string;
  module: string;
  /** The committee the notification belongs to. */
  committeeId: string;
  entityType: string;
  entityId: string;
  eventType: string;
  eventDetails: string;
  createdAt: Date;
  updatedAt: Date;
  recipientUserId: string | null;
  actorUserId: string | null;
  /** The module's structured details, as JSON. */
  data: string | null;
  isRead: boolean;
}

// What the user can see notifications for: the modules enabled on the
// committees they belong to. A user with no person (for example erp-admin)
// has none.
const getVisibleScope = async (user: NotificationUser | null | undefined) => {
  if (!user?._id || !user.personId) return null;
  return {
    userId: user._id,
    scope: await getPersonNotificationScope(user.personId),
  };
};

/** Narrows the notifications to one committee and/or one module. */
export interface NotificationFilter {
  committeeId?: string | null;
  module?: string | null;
}

const matchesFilter = (
  entry: { committeeId: string; module: string },
  { committeeId, module }: NotificationFilter
) =>
  (!committeeId || entry.committeeId === committeeId) &&
  (!module || entry.module === module);

/** How many unread notifications the user has in one module of one committee. */
export interface NotificationCount {
  committeeId: string;
  module: string;
  unreadCount: number;
}

/**
 * The user's unread notification counts, one row per committee and module
 * that has any. Cheap enough for the Workspaces page, which needs the counts
 * and not the notifications.
 */
export const getMyNotificationCounts = async (
  user: NotificationUser | null | undefined
): Promise<NotificationCount[]> => {
  const visible = await getVisibleScope(user);
  if (!visible) return [];
  const counts = await countUnreadNotificationsByCommittee(
    visible.userId,
    visible.scope
  );
  return counts.map(({ committeeId, module, count }) => ({
    committeeId,
    module,
    unreadCount: count,
  }));
};

/**
 * The user's notifications across their committees, newest change first;
 * optionally only one committee's and/or one module's.
 */
export const getMyNotifications = async (
  user: NotificationUser | null | undefined,
  { limit, offset, ...filter }: {
    limit?: number | null;
    offset?: number | null;
  } & NotificationFilter = {}
): Promise<MyNotification[]> => {
  const visible = await getVisibleScope(user);
  if (!visible) return [];

  const notifications = await getUserNotifications(
    visible.userId,
    visible.scope.filter(entry => matchesFilter(entry, filter)),
    { ...(limit ? { limit } : {}), ...(offset ? { skip: offset } : {}) }
  );
  return notifications.map(notification => ({
    _id: notification._id,
    module: notification.module,
    committeeId: notification.committeeId,
    entityType: notification.entityType,
    entityId: notification.entityId,
    eventType: notification.eventType,
    eventDetails: notification.eventDetails,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
    recipientUserId: notification.recipientUserId ?? null,
    actorUserId: notification.actorUserId ?? null,
    data: notification.data ? JSON.stringify(notification.data) : null,
    isRead: notification.isRead,
  }));
};

export const getMyUnreadNotificationCount = async (
  user: NotificationUser | null | undefined
): Promise<number> => {
  const visible = await getVisibleScope(user);
  if (!visible) return 0;
  return countUnreadNotifications(visible.userId, visible.scope);
};

/** Marks notifications as read by the user (only ones they can see). */
export const markMyNotificationsRead = async (
  user: NotificationUser | null | undefined,
  ids: string[]
): Promise<true> => {
  const visible = await getVisibleScope(user);
  if (!visible) return true;
  return markNotificationsRead(visible.userId, visible.scope, ids);
};
