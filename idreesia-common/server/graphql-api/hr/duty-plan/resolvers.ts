import { Duties, DutyLocations } from 'meteor/idreesia-common/server/collections/hr';
import {
  getDutyAttendanceCards,
  getDutyAttendanceSheet,
  getDutyPlanDays,
  getDutyPlanWeek,
  getKarkunDutyAttendanceSheet,
  setDutyAttendance,
  setDutyDayOverride,
  setDutyShiftTeam,
} from 'meteor/idreesia-common/server/business-logic/hr/duty-planning';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  DutyAttendanceSheetRowType: {
    karkun: async (row, args, { loaders }) => loaders.common.people.load(row.karkunId),
    duty: async row => Duties.findOneAsync(row.dutyId),
    location: async row => DutyLocations.findOneAsync(row.locationId),
  },

  DutyAttendanceCardType: {
    karkun: async (card, args, { loaders }) => loaders.common.people.load(card.karkunId),
    duty: async card => Duties.findOneAsync(card.dutyId),
  },

  Query: {
    dutyPlanWeek: async (obj, { dutyId, locationId }) =>
      getDutyPlanWeek(dutyId, locationId),
    dutyPlanDays: async (obj, { dutyId, locationId, startDate }) =>
      getDutyPlanDays(dutyId, locationId, startDate),
    dutyAttendanceSheet: async (obj, { month, dutyId, locationId, shiftId }) =>
      getDutyAttendanceSheet({ month, dutyId, locationId, shiftId }),
    karkunDutyAttendanceSheet: async (obj, { karkunId }) =>
      getKarkunDutyAttendanceSheet(karkunId),
    dutyAttendanceCards: async (
      obj,
      { month, dutyId, locationId, shiftId, karkunIds }
    ) => getDutyAttendanceCards({ month, dutyId, locationId, shiftId, karkunIds }),
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
