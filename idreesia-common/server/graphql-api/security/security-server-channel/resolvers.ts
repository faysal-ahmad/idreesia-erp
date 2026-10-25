import {
  SecurityServerAlerts,
  SecurityServerChannels,
} from 'meteor/idreesia-common/server/collections/security';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  SecurityServerChannelType: {
    alertsCount: async channel =>
      SecurityServerAlerts.find({ channelId: { $eq: channel._id } }).countAsync(),
  },
  Query: {
    allSecurityServerChannels: async (obj, { includeDeleted }) =>
      SecurityServerChannels.find(
        includeDeleted ? {} : { deletedAt: { $exists: false } },
        { sort: { name: 1 } }
      ).fetchAsync(),
  },
};

export default resolvers;
