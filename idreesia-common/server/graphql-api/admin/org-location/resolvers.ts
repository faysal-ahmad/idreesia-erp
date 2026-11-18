import {
  DutiesAttendancePermissionInfos,
} from 'meteor/idreesia-common/constants/duties-attendance';
import {
  OrgLocationFeatures,
  type OrgLocationType,
} from 'meteor/idreesia-common/constants/organization';
import { getDataLoaders } from 'meteor/idreesia-common/server/data-loaders';
import {
  OrgLocations,
  Users,
  type OrgLocationDocument,
  type OrgLocationMehfilDetails,
} from 'meteor/idreesia-common/server/collections/admin';
import { searchWorkspaceUserCandidates } from 'meteor/idreesia-common/server/business-logic/duties-attendance';
import {
  DutiesAttendanceWorkspaceUsers,
  type DutiesAttendanceWorkspaceUserDocument,
} from 'meteor/idreesia-common/server/collections/duties-attendance';
import {
  addOrgLocationDutiesAttendanceUser,
  addOrgLocationObserver,
  createOrgLocation,
  disableOrgLocationFeature,
  enableOrgLocationFeature,
  getLocationDutiesAttendanceWorkspaceId,
  removeOrgLocationDutiesAttendanceUser,
  removeOrgLocationObserver,
  updateOrgLocation,
  updateOrgLocationDutiesAttendanceUserPermissions,
} from 'meteor/idreesia-common/server/business-logic/admin';

interface ResolverContext {
  user: { _id: string };
  loaders: ReturnType<typeof getDataLoaders>;
}

interface OrgLocationArgs {
  _id: string;
  name: string;
  type: OrgLocationType;
  parentId?: string | null;
  mehfilDetails?: OrgLocationMehfilDetails | null;
}

export default {
  OrgLocationType: {
    parent: async (location: OrgLocationDocument) =>
      location.parentId
        ? OrgLocations.findOneAsync({ _id: location.parentId })
        : null,

    committees: async (
      location: OrgLocationDocument,
      args: unknown,
      { loaders }: ResolverContext
    ) => loaders.admin.locationCommittees.load(location._id as string),

    observerKarkunIds: (location: OrgLocationDocument) =>
      location.observerKarkunIds ?? [],

    features: (location: OrgLocationDocument) => location.features ?? [],

    observers: async (
      location: OrgLocationDocument,
      args: unknown,
      { loaders }: ResolverContext
    ) => {
      const people = await Promise.all(
        (location.observerKarkunIds ?? []).map(id => loaders.common.people.load(id))
      );
      return people.filter(Boolean);
    },
  },

  OrgLocationDutiesAttendanceUserType: {
    username: async (entry: DutiesAttendanceWorkspaceUserDocument) =>
      (await Users.findOneAsync(entry.userId))?.username,
    displayName: async (entry: DutiesAttendanceWorkspaceUserDocument) =>
      (await Users.findOneAsync(entry.userId))?.displayName,
  },

  Query: {
    allOrgLocationFeatures: async () => OrgLocationFeatures,

    dutiesAttendanceUserCandidates: async (
      _obj: unknown,
      { search }: { search?: string }
    ) => searchWorkspaceUserCandidates(search),

    allDutiesAttendancePermissions: async () => DutiesAttendancePermissionInfos,

    orgLocationDutiesAttendanceUsers: async (
      _obj: unknown,
      { locationId }: { locationId: string }
    ) => {
      const location = await OrgLocations.findOneAsync({ _id: locationId });
      const workspaceId = getLocationDutiesAttendanceWorkspaceId(
        (location ?? {}) as OrgLocationDocument
      );
      return DutiesAttendanceWorkspaceUsers.find({ workspaceId }).fetchAsync();
    },

    allOrgLocations: async () =>
      OrgLocations.find({}, { sort: { name: 1 } }).fetchAsync(),

    orgLocationById: async (_obj: unknown, { _id }: Pick<OrgLocationArgs, '_id'>) =>
      OrgLocations.findOneAsync({ _id }),
  },

  Mutation: {
    createOrgLocation: async (
      _obj: unknown,
      params: Omit<OrgLocationArgs, '_id'>,
      { user }: ResolverContext
    ) => createOrgLocation(params, user),

    updateOrgLocation: async (
      _obj: unknown,
      params: Omit<OrgLocationArgs, 'type'>,
      { user }: ResolverContext
    ) => updateOrgLocation(params, user),

    addOrgLocationObserver: async (
      _obj: unknown,
      { locationId, karkunId }: { locationId: string; karkunId: string },
      { user }: ResolverContext
    ) => addOrgLocationObserver(locationId, karkunId, user),

    removeOrgLocationObserver: async (
      _obj: unknown,
      { locationId, karkunId }: { locationId: string; karkunId: string },
      { user }: ResolverContext
    ) => removeOrgLocationObserver(locationId, karkunId, user),

    enableOrgLocationFeature: async (
      _obj: unknown,
      { locationId, featureKey }: { locationId: string; featureKey: string },
      { user }: ResolverContext
    ) => enableOrgLocationFeature(locationId, featureKey, user._id),

    disableOrgLocationFeature: async (
      _obj: unknown,
      { locationId, featureKey }: { locationId: string; featureKey: string },
      { user }: ResolverContext
    ) => disableOrgLocationFeature(locationId, featureKey, user._id),

    addOrgLocationDutiesAttendanceUser: async (
      _obj: unknown,
      {
        locationId,
        userId,
        permissions,
      }: { locationId: string; userId: string; permissions: string[] },
      { user }: ResolverContext
    ) =>
      addOrgLocationDutiesAttendanceUser(
        locationId,
        { userId, permissions },
        user._id
      ),

    updateOrgLocationDutiesAttendanceUserPermissions: async (
      _obj: unknown,
      {
        locationId,
        userId,
        permissions,
      }: { locationId: string; userId: string; permissions: string[] },
      { user }: ResolverContext
    ) =>
      updateOrgLocationDutiesAttendanceUserPermissions(
        locationId,
        userId,
        permissions,
        user._id
      ),

    removeOrgLocationDutiesAttendanceUser: async (
      _obj: unknown,
      { locationId, userId }: { locationId: string; userId: string },
      { user }: ResolverContext
    ) => {
      await removeOrgLocationDutiesAttendanceUser(locationId, userId, user._id);
      return true;
    },
  },
};
