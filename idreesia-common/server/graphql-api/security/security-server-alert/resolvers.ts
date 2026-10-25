import { SecurityServerAlerts } from 'meteor/idreesia-common/server/collections/security';
import { getFileUrl } from 'meteor/idreesia-common/server/file-storage';

import { getSecurityServerAlerts } from './queries';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  SecurityServerAlertType: {
    imageUrl: async alert => getFileUrl(alert.imageKey),
  },
  Query: {
    pagedSecurityServerAlerts: async (obj, { filter }) =>
      getSecurityServerAlerts(filter ?? {}),

    securityServerAlertById: async (obj, { _id }) =>
      SecurityServerAlerts.findOneAsync(_id),
  },
};

export default resolvers;
