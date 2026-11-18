import type { OrgLocationType } from 'meteor/idreesia-common/constants/organization';
import { getDataLoaders } from 'meteor/idreesia-common/server/data-loaders';
import {
  OrgLocations,
  type OrgLocationDocument,
  type OrgLocationMehfilDetails,
} from 'meteor/idreesia-common/server/collections/admin';
import {
  addOrgLocationObserver,
  createOrgLocation,
  removeOrgLocationObserver,
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

  Query: {
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
  },
};
