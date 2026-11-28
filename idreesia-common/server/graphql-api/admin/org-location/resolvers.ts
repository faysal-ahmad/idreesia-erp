import { DataSource } from 'meteor/idreesia-common/constants';
import { ChatError } from 'meteor/idreesia-common/server/chat';
import type { OrgLocationType } from 'meteor/idreesia-common/constants/organization';
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
  createOrgLocationUserChatAccount,
  getOrgLocationObserverStats,
  linkOrgLocationUser,
  listLinkableUsers,
  listOrgLocationKarkuns,
  searchOrgLocationObserverKarkuns,
  listOrgLocationUsers,
  listOrgLocationFeaturePermissions,
  removeOrgLocationFeatureUser,
  removeOrgLocationObserver,
  resetOrgLocationUserPassword,
  setOrgLocationUserLocked,
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
    orgLocationFeaturePermissions: async (
      _obj: unknown,
      { locationId }: { locationId: string }
    ) => listOrgLocationFeaturePermissions(locationId),

    pagedOrgLocationObserverKarkuns: async (
      _obj: unknown,
      params: {
        name?: string | null;
        cnicNumber?: string | null;
        phoneNumber?: string | null;
        pageIndex?: string | null;
        pageSize?: string | null;
      }
    ) => searchOrgLocationObserverKarkuns(params),

    pagedOrgLocationKarkuns: async (
      _obj: unknown,
      params: {
        locationId: string;
        name?: string | null;
        cnicNumber?: string | null;
        phoneNumber?: string | null;
        withUserAccount?: boolean | null;
        includeChildLocations?: boolean | null;
        pageIndex?: string | null;
        pageSize?: string | null;
      }
    ) => listOrgLocationKarkuns(params),

    pagedOrgLocationUsers: async (
      _obj: unknown,
      params: { locationId: string; pageIndex?: string | null; pageSize?: string | null }
    ) => listOrgLocationUsers(params),

    pagedLinkableUsers: async (
      _obj: unknown,
      params: { search?: string | null; pageIndex?: string | null; pageSize?: string | null }
    ) => listLinkableUsers(params),

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

    linkOrgLocationUser: async (
      _obj: unknown,
      { locationId, karkunId, userId }: { locationId: string; karkunId: string; userId: string }
    ) => linkOrgLocationUser(locationId, karkunId, userId),

    resetOrgLocationUserPassword: async (
      _obj: unknown,
      params: { locationId: string; userId: string; password: string },
      { user }: ResolverContext
    ) => resetOrgLocationUserPassword(params, user, DataSource.ADMIN),

    setOrgLocationUserLocked: async (
      _obj: unknown,
      params: { locationId: string; userId: string; locked: boolean },
      { user }: ResolverContext
    ) => setOrgLocationUserLocked(params, user, DataSource.ADMIN),

    createOrgLocationUserChatAccount: async (
      _obj: unknown,
      params: { locationId: string; userId: string },
      { user }: ResolverContext
    ) => {
      try {
        return await createOrgLocationUserChatAccount(
          params,
          user,
          DataSource.ADMIN
        );
      } catch (error) {
        if (error instanceof ChatError) {
          throw new Error(`Chat: ${error.message}`);
        }
        throw error;
      }
    },

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
