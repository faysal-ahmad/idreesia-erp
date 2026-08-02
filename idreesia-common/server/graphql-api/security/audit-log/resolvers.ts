import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';
import { EntityType } from 'meteor/idreesia-common/constants/audit';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    pagedSecurityAuditLogs: async (obj, { filter }) => {
      const updatedFilter = Object.assign({}, filter, {
        entityTypes: [EntityType.VISITOR],
      });

      return AuditLogs.searchAuditLogs(updatedFilter);
    },
  },
};

export default resolvers;
