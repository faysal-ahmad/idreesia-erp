import {
  getNightStayById,
  getNightStayHistory,
  getNightStays,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import { assertNightStayReportEnabled } from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  // Only reachable through the queries below, which check committee access.
  WorkspaceNightStayType: {
    stayHistory: (stay: { _id: string; visitorId?: string }) =>
      stay.visitorId ? getNightStayHistory(stay.visitorId, stay._id) : [],
  },

  Query: {
    workspaceNightStays: async (
      obj,
      { committeeId, ...filter },
      context
    ) => {
      assertNightStayReportEnabled(context, committeeId);
      return getNightStays(filter);
    },

    workspaceNightStayById: async (obj, { committeeId, stayId }, context) => {
      assertNightStayReportEnabled(context, committeeId);
      return getNightStayById(stayId);
    },
  },
};

export default resolvers;
