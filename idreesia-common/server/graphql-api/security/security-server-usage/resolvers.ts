import {
  getSecurityServerUsageSummary,
  USAGE_STATS_RETENTION_DAYS,
} from 'meteor/idreesia-common/server/business-logic/security/security-server';

const MAX_MINUTES = USAGE_STATS_RETENTION_DAYS * 24 * 60;

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    securityServerUsageStats: async (obj, { minutes }) => {
      if (!Number.isInteger(minutes) || minutes < 1 || minutes > MAX_MINUTES) {
        throw new Error(`'minutes' must be from 1 to ${MAX_MINUTES}.`);
      }
      return getSecurityServerUsageSummary(minutes);
    },
  },
};

export default resolvers;
