import {
  SecurityServerAlerts,
  SecurityServerChannels,
} from 'meteor/idreesia-common/server/collections/security';
import {
  createSecurityServerChannel,
  deleteSecurityServerChannel,
  updateSecurityServerChannel,
} from 'meteor/idreesia-common/server/business-logic/security/security-server';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  SecurityServerChannelType: {
    alertsCount: async channel =>
      SecurityServerAlerts.find({
        channelId: { $eq: channel._id },
      }).countAsync(),
  },
  SecurityServerChannelConnectionType: {
    hasPassword: connection => !!connection.password,
  },
  Query: {
    allSecurityServerChannels: async (obj, { includeDeleted }) =>
      SecurityServerChannels.find(
        includeDeleted ? {} : { deletedAt: { $exists: false } },
        { sort: { name: 1 } }
      ).fetchAsync(),

    securityServerChannelById: async (obj, { _id }) =>
      SecurityServerChannels.findOneAsync(_id),
  },
  Mutation: {
    createSecurityServerChannel: async (obj, values, { user }) => {
      const channelId = await createSecurityServerChannel(user, values);
      return SecurityServerChannels.findOneAsync(channelId);
    },

    updateSecurityServerChannel: async (obj, { _id, ...values }, { user }) => {
      await updateSecurityServerChannel(user, _id, values);
      return SecurityServerChannels.findOneAsync(_id);
    },

    deleteSecurityServerChannel: async (obj, { _id }, { user }) => {
      await deleteSecurityServerChannel(user, _id);
      return 1;
    },
  },
};

export default resolvers;
