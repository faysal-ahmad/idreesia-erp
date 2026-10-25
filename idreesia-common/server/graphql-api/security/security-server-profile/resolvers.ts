import {
  SecurityServerAlerts,
  SecurityServerProfiles,
} from 'meteor/idreesia-common/server/collections/security';
import { getFileUrl } from 'meteor/idreesia-common/server/file-storage';

import { getSecurityServerProfiles } from './queries';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  SecurityServerProfileImageType: {
    imageUrl: async image => getFileUrl(image.imageKey),
  },
  SecurityServerProfileType: {
    alertsCount: async profile =>
      SecurityServerAlerts.find({ profileId: { $eq: profile._id } }).countAsync(),
  },
  Query: {
    pagedSecurityServerProfiles: async (obj, { filter }) =>
      getSecurityServerProfiles(filter ?? {}),

    securityServerProfileById: async (obj, { _id }) =>
      SecurityServerProfiles.findOneAsync(_id),
  },
};

export default resolvers;
