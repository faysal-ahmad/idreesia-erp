import { getWorkspaceMonitoringAlerts } from 'meteor/idreesia-common/server/business-logic/admin/committee';

import { assertMonitoringAlertsEnabled } from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    workspaceMonitoringAlerts: async (
      obj,
      { committeeId, ...filter },
      context
    ) => {
      assertMonitoringAlertsEnabled(context, committeeId);
      return getWorkspaceMonitoringAlerts(filter);
    },
  },
};

export default resolvers;
