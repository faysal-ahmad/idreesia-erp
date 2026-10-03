import {
  Duties,
  DutyLocations,
  DutyRosters,
} from 'meteor/idreesia-common/server/collections/hr';
import {
  activeDutyRosters,
  archiveDutyRoster,
  createDutyRoster,
  getDutyRosterDay,
  getDutyRosterDays,
  getDutyRosterWeek,
  pagedDutyRosters,
  setDutyRosterDayOverride,
  setDutyRosterShiftTeam,
  updateDutyRoster,
} from 'meteor/idreesia-common/server/business-logic/hr/duty-rosters';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const resolvers: ResolverMap = {
  DutyRosterType: {
    duty: async roster => Duties.findOneAsync(roster.dutyId),
    location: async roster => DutyLocations.findOneAsync(roster.locationId),
  },

  Query: {
    pagedDutyRosters: async (
      obj,
      { dutyId, locationId, status, pageIndex, pageSize }
    ) =>
      pagedDutyRosters({
        dutyId,
        locationId,
        status,
        pageIndex,
        pageSize,
      }),
    activeDutyRosters: async (obj, { dutyId, locationId }) =>
      activeDutyRosters({ dutyId, locationId }),
    dutyRosterById: async (obj, { id }) => DutyRosters.findOneAsync(id),
    dutyRosterWeek: async (obj, { rosterId }) => getDutyRosterWeek(rosterId),
    dutyRosterDay: async (obj, { rosterId, date }) =>
      getDutyRosterDay(rosterId, date),
    dutyRosterDays: async (obj, { rosterId, startDate }) =>
      getDutyRosterDays(rosterId, startDate),
  },

  Mutation: {
    createDutyRoster: async (
      obj,
      { dutyId, locationId, startDate, endDate },
      { user }
    ) =>
      createDutyRoster({
        dutyId,
        locationId,
        startDate,
        endDate,
        user,
      }),
    updateDutyRoster: async (obj, { id, endDate }, { user }) =>
      updateDutyRoster({ id, endDate, user }),
    archiveDutyRoster: async (obj, { id }, { user }) =>
      archiveDutyRoster({ id, user }),
    setDutyRosterShiftTeam: async (obj, { rosterId, shiftId, teamId }, { user }) =>
      setDutyRosterShiftTeam({
        rosterId,
        shiftId,
        teamId,
        user,
      }),
    setDutyRosterDayOverride: async (
      obj,
      { rosterId, shiftId, date, addedKarkunIds, absentKarkunIds },
      { user }
    ) =>
      setDutyRosterDayOverride({
        rosterId,
        shiftId,
        date,
        addedKarkunIds,
        absentKarkunIds,
        user,
      }),
  },
};

export default resolvers;
