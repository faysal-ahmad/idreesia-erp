import { getDataLoaders } from 'meteor/idreesia-common/server/data-loaders';
import {
  DutiesAttendanceDuties,
  type DutiesAttendanceDutyDocument,
  type DutyMember,
} from 'meteor/idreesia-common/server/collections/duties-attendance';
import {
  addDutyMember,
  createDuty,
  getAttendanceSheet,
  getDutyPlanDays,
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
      const { workspaceId } = getDutiesAttendanceAccess(context, locationId);
      return DutiesAttendanceDuties.find(
        { workspaceId },
        { sort: { name: 1 } }
      ).fetchAsync();
    },

    workspaceDaDutyById: async (
      obj: unknown,
      { locationId, dutyId }: DutyArgs,
      context: Context
    ) => {
      const { workspaceId } = getDutiesAttendanceAccess(context, locationId);
      return DutiesAttendanceDuties.findOneAsync({ _id: dutyId, workspaceId });
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
      const { workspaceId } = getDutiesAttendanceAccess(context, locationId);
      return getDutyPlanDays({ workspaceId, dutyId, startDate });
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
      return searchWorkspaceKarkuns(params);
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
      const { workspaceId } = getDutiesAttendanceAccess(context, locationId);
      return getAttendanceSheet({ workspaceId, month, dutyId });
    },
  },

  Mutation: {
    workspaceDaCreateDuty: async (
      obj: unknown,
      {
        locationId,
        name,
        description,
      }: { locationId: string; name: string; description?: string },
      context: Context
    ) => {
      const { workspaceId, userId } = getDutiesAttendanceAccess(
        context,
        locationId
      );
      return createDuty(workspaceId, { name, description }, userId);
    },

    workspaceDaUpdateDuty: async (
      obj: unknown,
      {
        locationId,
        dutyId,
        ...changes
      }: DutyArgs & {
        name?: string;
        description?: string | null;
        isActive?: boolean;
      },
      context: Context
    ) => {
      const { workspaceId, userId } = getDutiesAttendanceAccess(
        context,
        locationId
      );
      return updateDuty(workspaceId, dutyId, changes, userId);
    },

    workspaceDaRemoveDuty: async (
      obj: unknown,
      { locationId, dutyId }: DutyArgs,
      context: Context
    ) => {
      const { workspaceId, userId } = getDutiesAttendanceAccess(
        context,
        locationId
      );
      await removeDuty(workspaceId, dutyId, userId);
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
        daysOfWeek?: string[];
      },
      context: Context
    ) => {
      const { workspaceId, userId } = getDutiesAttendanceAccess(
        context,
        locationId
      );
      return addDutyMember(workspaceId, dutyId, member, userId);
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
        daysOfWeek?: string[];
      },
      context: Context
    ) => {
      const { workspaceId, userId } = getDutiesAttendanceAccess(
        context,
        locationId
      );
      return updateDutyMember(workspaceId, dutyId, member, userId);
    },

    workspaceDaRemoveDutyMember: async (
      obj: unknown,
      { locationId, dutyId, karkunId }: DutyArgs & { karkunId: string },
      context: Context
    ) => {
      const { workspaceId, userId } = getDutiesAttendanceAccess(
        context,
        locationId
      );
      return removeDutyMember(workspaceId, dutyId, karkunId, userId);
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
      const { workspaceId, userId } = getDutiesAttendanceAccess(
        context,
        locationId
      );
      return setDutyDayOverride({
        workspaceId,
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
      const { workspaceId, userId } = getDutiesAttendanceAccess(
        context,
        locationId
      );
      return setDutyAttendance({
        workspaceId,
        dutyId,
        date,
        karkunId,
        status,
        source,
        geo,
        userId,
      });
    },
  },
};
