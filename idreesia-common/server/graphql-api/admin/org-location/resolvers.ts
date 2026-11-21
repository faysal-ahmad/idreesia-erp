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
import {
  addOrgLocationFeatureUser,
  addOrgLocationObserver,
  createOrgLocation,
  disableOrgLocationFeature,
  enableOrgLocationFeature,
  getOrgLocationObserverStats,
  listOrgLocationFeaturePermissions,
  removeOrgLocationFeatureUser,
  removeOrgLocationObserver,
  syncOrgLocationObservers,
  updateOrgLocation,
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

    observerStats: (location: OrgLocationDocument) =>
      getOrgLocationObserverStats(location),

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

  OrgLocationFeaturePermissionType: {
    users: async ({ userIds }: { userIds: string[] }) => {
      const users = await Users.find({ _id: { $in: userIds } }).fetchAsync();
      return users.map(user => ({
        userId: user._id,
        personId: user.personId,
        username: user.username,
        displayName: user.displayName,
      }));
    },
  },

  Query: {
    allOrgLocationFeatures: async () => OrgLocationFeatures,

    orgLocationFeaturePermissions: async (
      _obj: unknown,
      { locationId }: { locationId: string }
    ) => listOrgLocationFeaturePermissions(locationId),

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

    syncOrgLocationObservers: async (
      _obj: unknown,
      { locationId }: { locationId: string },
      { user }: ResolverContext
    ) => syncOrgLocationObservers(locationId, user),

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

    addOrgLocationFeatureUser: async (
      _obj: unknown,
      args: {
        locationId: string;
        featureKey: string;
        permissionKey: string;
        karkunId: string;
      },
      { user }: ResolverContext
    ) =>
      addOrgLocationFeatureUser(
        args.locationId,
        args.featureKey,
        args.permissionKey,
        args.karkunId,
        user._id
      ),

    removeOrgLocationFeatureUser: async (
      _obj: unknown,
      args: {
        locationId: string;
        featureKey: string;
        permissionKey: string;
        userId: string;
      },
      { user }: ResolverContext
    ) =>
      removeOrgLocationFeatureUser(
        args.locationId,
        args.featureKey,
        args.permissionKey,
        args.userId,
        user._id
      ),
  },
};
