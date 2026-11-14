import {
  getMyNotificationCounts,
  getMyNotifications,
  getMyUnreadNotificationCount,
  markMyNotificationsRead,
} from 'meteor/idreesia-common/server/business-logic/hr/committee/notifications';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

// What the user can see follows their committee membership, which the
// business logic works out; the resolvers only pass the user through.
const resolvers: ResolverMap = {
  Query: {
    myNotifications: async (obj, { limit, offset, committeeId, module }, { user }) => {
      const notifications = await getMyNotifications(user, {
        limit,
        offset,
        committeeId,
        module,
      });
      return notifications.map(notification => ({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      }));
    },

    myNotificationCounts: async (obj, args, { user }) => getMyNotificationCounts(user),

    myUnreadNotificationCount: async (obj, args, { user }) =>
      getMyUnreadNotificationCount(user),
  },

  Mutation: {
    markNotificationsRead: async (obj, { ids }, { user }) =>
      markMyNotificationsRead(user, (ids ?? []).filter(Boolean)),
  },
};

export default resolvers;
