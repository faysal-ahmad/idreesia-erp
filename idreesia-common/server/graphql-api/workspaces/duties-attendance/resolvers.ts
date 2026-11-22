import { DutiesAttendancePermissions } from 'meteor/idreesia-common/constants/duties-attendance';
import { getDataLoaders } from 'meteor/idreesia-common/server/data-loaders';
import {
  DutiesAttendanceDuties,
  type DutiesAttendanceDutyDocument,
  type DutyMember,
} from 'meteor/idreesia-common/server/collections/duties-attendance';
import { MehfilTemplateDuties } from 'meteor/idreesia-common/server/collections/admin';
import {
  addDutyMember,
  addDuties,
  getAttendanceSheet,
  getDutyPlanDays,
  getDutyNames,
  listMyDuties,
  listMyDutiesAttendanceLocations,
  searchWorkspaceKarkuns,
  removeDuty,
  removeDutyMember,
  setDutyAttendance,
  setDutyDayOverride,
  updateDuty,
  updateDutyMember,
} from 'meteor/idreesia-common/server/business-logic/duties-attendance';

import {
  getDutiesAttendanceAccess,
  type DutiesAttendanceAccessContext,
} from './access';

interface Context extends DutiesAttendanceAccessContext {
  loaders: ReturnType<typeof getDataLoaders>;
}

interface DutyArgs {
  locationId: string;
  dutyId: string;
}

// Who may call each field (workspace permission) is declared in the schema
// with @checkDutiesAttendanceAccess. The duties and attendance module does
// the work and enforces its own rules.
export default {
  DaDutyType: {
    isActive: (duty: DutiesAttendanceDutyDocument) => duty.isActive !== false,
    // Name and description belong to the mehfil template duty.
    name: async (
      duty: DutiesAttendanceDutyDocument,
      args: unknown,
      { loaders }: Pick<Context, 'loaders'>
    ) =>
      (await loaders.admin.mehfilTemplateDuties.load(duty.mehfilDutyId))
        ?.name ?? '',
    description: async (
      duty: DutiesAttendanceDutyDocument,
      args: unknown,
      { loaders }: Pick<Context, 'loaders'>
    ) =>
      (await loaders.admin.mehfilTemplateDuties.load(duty.mehfilDutyId))
        ?.description,
  },

  DaDutyMemberType: {
    karkun: async (
      member: DutyMember,
      args: unknown,
      { loaders }: Pick<Context, 'loaders'>
    ) => loaders.common.people.load(member.karkunId),
  },

  Query: {
    myDutiesAttendanceLocations: async (
      obj: unknown,
      args: unknown,
      { user }: Context
    ) => listMyDutiesAttendanceLocations(user),

    myDuties: async (
      obj: unknown,
      { date }: { date: string },
      { user }: Context
    ) => listMyDuties(user, date),

    workspaceDaAccess: async (
      obj: unknown,
      { locationId }: { locationId: string },
      context: Context
    ) => {
      const { permissions } = getDutiesAttendanceAccess(context, locationId);
      return { locationId, permissions };
    },

    workspaceDaDuties: async (
      obj: unknown,
      { locationId }: { locationId: string },
      context: Context
    ) => {
      getDutiesAttendanceAccess(context, locationId);
      const duties = await DutiesAttendanceDuties.find({
        locationId,
      }).fetchAsync();
      // Sorted by the template duty's name.
      const names = await getDutyNames(duties);
      return duties.sort((left, right) =>
        (names.get(left._id) ?? '').localeCompare(names.get(right._id) ?? '')
      );
    },

    workspaceDaMehfilDuties: async (
      obj: unknown,
      { locationId }: { locationId: string },
      context: Context
    ) => {
      getDutiesAttendanceAccess(context, locationId);
      return MehfilTemplateDuties.find({}, { sort: { name: 1 } }).fetchAsync();
    },

    workspaceDaDutyById: async (
      obj: unknown,
      { locationId, dutyId }: DutyArgs,
      context: Context
    ) => {
      getDutiesAttendanceAccess(context, locationId);
      return DutiesAttendanceDuties.findOneAsync({ _id: dutyId, locationId });
    },

    workspaceDaPlanDays: async (
      obj: unknown,
      {
        locationId,
        dutyId,
        startDate,
      }: DutyArgs & { startDate: string },
      context: Context
    ) => {
      getDutiesAttendanceAccess(context, locationId);
      return getDutyPlanDays({ locationId, dutyId, startDate });
    },

    workspaceDaKarkunSearch: async (
      obj: unknown,
      {
        locationId,
        ...params
      }: {
        locationId: string;
        name?: string;
        cnicNumber?: string;
        phoneNumber?: string;
        pageIndex?: string;
        pageSize?: string;
      },
      context: Context
    ) => {
      getDutiesAttendanceAccess(context, locationId);
      return searchWorkspaceKarkuns({ ...params, locationId });
    },

    workspaceDaAttendanceSheet: async (
      obj: unknown,
      {
        locationId,
        month,
        dutyId,
      }: { locationId: string; month: string; dutyId?: string | null },
      context: Context
    ) => {
      getDutiesAttendanceAccess(context, locationId);
      return getAttendanceSheet({ locationId, month, dutyId });
    },
  },

  Mutation: {
    workspaceDaAddDuties: async (
      obj: unknown,
      {
        locationId,
        mehfilDutyIds,
      }: { locationId: string; mehfilDutyIds: string[] },
      context: Context
    ) => {
      const { userId } = getDutiesAttendanceAccess(context, locationId);
      return addDuties(locationId, mehfilDutyIds, userId);
    },

    workspaceDaUpdateDuty: async (
      obj: unknown,
      {
        locationId,
        dutyId,
        ...changes
      }: DutyArgs & {
        isActive?: boolean;
      },
      context: Context
    ) => {
      const { userId } = getDutiesAttendanceAccess(context, locationId);
      return updateDuty(locationId, dutyId, changes, userId);
    },

    workspaceDaRemoveDuty: async (
      obj: unknown,
      { locationId, dutyId }: DutyArgs,
      context: Context
    ) => {
      const { userId } = getDutiesAttendanceAccess(context, locationId);
      await removeDuty(locationId, dutyId, userId);
      return true;
    },

    workspaceDaAddDutyMember: async (
      obj: unknown,
      {
        locationId,
        dutyId,
        ...member
      }: DutyArgs & {
        karkunId: string;
        isCoordinator?: boolean;
        canMarkOwnAttendance?: boolean;
        daysOfWeek?: string[];
      },
      context: Context
    ) => {
      const { userId } = getDutiesAttendanceAccess(context, locationId);
      return addDutyMember(locationId, dutyId, member, userId);
    },

    workspaceDaUpdateDutyMember: async (
      obj: unknown,
      {
        locationId,
        dutyId,
        ...member
      }: DutyArgs & {
        karkunId: string;
        isCoordinator?: boolean;
        canMarkOwnAttendance?: boolean;
        daysOfWeek?: string[];
      },
      context: Context
    ) => {
      const { userId } = getDutiesAttendanceAccess(context, locationId);
      return updateDutyMember(locationId, dutyId, member, userId);
    },

    workspaceDaRemoveDutyMember: async (
      obj: unknown,
      { locationId, dutyId, karkunId }: DutyArgs & { karkunId: string },
      context: Context
    ) => {
      const { userId } = getDutiesAttendanceAccess(context, locationId);
      return removeDutyMember(locationId, dutyId, karkunId, userId);
    },

    workspaceDaSetDayOverride: async (
      obj: unknown,
      {
        locationId,
        dutyId,
        date,
        addedKarkunIds,
        absentKarkunIds,
      }: DutyArgs & {
        date: string;
        addedKarkunIds?: string[];
        absentKarkunIds?: string[];
      },
      context: Context
    ) => {
      const { userId } = getDutiesAttendanceAccess(context, locationId);
      return setDutyDayOverride({
        locationId,
        dutyId,
        date,
        addedKarkunIds,
        absentKarkunIds,
        userId,
      });
    },

    workspaceDaSetAttendance: async (
      obj: unknown,
      {
        locationId,
        dutyId,
        date,
        karkunId,
        status,
        source,
        geo,
      }: DutyArgs & {
        date: string;
        karkunId: string;
        status?: string;
        source?: string;
        geo?: { latitude: number; longitude: number; accuracy?: number };
      },
      context: Context
    ) => {
      const { userId, permissions } = getDutiesAttendanceAccess(
        context,
        locationId
      );
      return setDutyAttendance({
        locationId,
        dutyId,
        date,
        karkunId,
        status,
        source,
        geo,
        userId,
        canMarkAnyone: permissions.includes(
          DutiesAttendancePermissions.MARK_ATTENDANCE
        ),
        callerKarkunId: context.user?.personId,
      });
    },
  },
};
