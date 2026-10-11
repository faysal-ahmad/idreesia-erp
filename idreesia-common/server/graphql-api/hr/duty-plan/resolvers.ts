import {
  getDutyPlanDays,
  getDutyPlanWeek,
  setDutyAttendance,
  setDutyDayOverride,
  setDutyShiftTeam,
} from 'meteor/idreesia-common/server/business-logic/hr/duty-planning';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  Query: {
    dutyPlanWeek: async (obj, { dutyId, locationId }) =>
      getDutyPlanWeek(dutyId, locationId),
    dutyPlanDays: async (obj, { dutyId, locationId, startDate }) =>
      getDutyPlanDays(dutyId, locationId, startDate),
  },

  Mutation: {
    setDutyShiftTeam: async (
      obj,
      { dutyId, locationId, shiftId, teamId },
      { user }
    ) =>
      setDutyShiftTeam({
        dutyId,
        locationId,
        shiftId,
        teamId,
        user,
      }),
    setDutyDayOverride: async (
      obj,
      { dutyId, locationId, shiftId, date, addedKarkunIds, absentKarkunIds },
      { user }
    ) =>
      setDutyDayOverride({
        dutyId,
        locationId,
        shiftId,
        date,
        addedKarkunIds,
        absentKarkunIds,
        user,
      }),
    setDutyAttendance: async (
      obj,
      { dutyId, locationId, shiftId, date, karkunId, status },
      { user }
    ) =>
      setDutyAttendance({
        dutyId,
        locationId,
        shiftId,
        date,
        karkunId,
        status,
        user,
      }),
  },
};

export default resolvers;
