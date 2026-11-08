import { getWorkspaceMonitoringAlerts } from 'meteor/idreesia-common/server/business-logic/hr/committee';

import { assertCanViewMonitoringAlerts } from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    workspaceMonitoringAlerts: async (
      obj,
      { committeeId, ...filter },
      { user }
    ) => {
      await assertCanViewMonitoringAlerts(user, committeeId);
      return getWorkspaceMonitoringAlerts(filter);
    },
  },
};

export default resolvers;
