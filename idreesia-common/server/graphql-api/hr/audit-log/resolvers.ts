import { EntityType } from 'meteor/idreesia-common/constants/audit';
import {
  searchAuditLogs,
} from 'meteor/idreesia-common/server/business-logic/common';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    pagedHrAuditLogs: async (obj, { filter }) => {
      const updatedFilter = Object.assign({}, filter, {
        entityTypes: [EntityType.KARKUN],
      });

      return searchAuditLogs(updatedFilter);
    },
  },
};

export default resolvers;
