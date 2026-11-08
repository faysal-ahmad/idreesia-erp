import {
  getNightStayById,
  getNightStayHistory,
  getNightStays,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import { assertCanViewNightStayReport } from './access';

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
      { user }
    ) => {
      await assertCanViewNightStayReport(user, committeeId);
      return getNightStays(filter);
    },

    workspaceNightStayById: async (obj, { committeeId, stayId }, { user }) => {
      await assertCanViewNightStayReport(user, committeeId);
      return getNightStayById(stayId);
    },
  },
};

export default resolvers;
