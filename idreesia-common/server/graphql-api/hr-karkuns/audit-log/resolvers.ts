import { EntityType } from 'meteor/idreesia-common/constants/audit';
import { searchAuditLogs } from 'meteor/idreesia-common/server/business-logic/common';
import { HR_KARKUN_SELECTOR } from 'meteor/idreesia-common/server/business-logic/hr-common/hr-person-roles';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

// The audit entries of karkun management.
const ENTITY_TYPES = [EntityType.KARKUN];

const resolvers: ResolverMap = {
  Query: {
    pagedHrKarkunsAuditLogs: async (obj, { filter }) =>
      searchAuditLogs({
        ...filter,
        entityTypes: ENTITY_TYPES,
        // Plus the person entries (shared data changes) of the module's own people.
        personEntitySelector: HR_KARKUN_SELECTOR,
      }),
  },
};

export default resolvers;
