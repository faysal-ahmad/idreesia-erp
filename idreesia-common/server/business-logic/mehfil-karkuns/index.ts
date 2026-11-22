import { GraphQLError } from 'graphql';

import {
  MehfilKarkunsPermissionValues,
  type MehfilKarkunsPermission,
} from 'meteor/idreesia-common/constants/mehfil-karkuns';
import {
  OrgLocationFeatureAllowedTypes,
  OrgLocationFeatureKeys,
  orgLocationGroupPermissionKeys,
  type OrgLocationType,
} from 'meteor/idreesia-common/constants/organization';
import {
  OrgLocations,
  OrgLocationUsers,
} from 'meteor/idreesia-common/server/collections/admin';
import { isSuperAdmin } from 'meteor/idreesia-common/server/business-logic/admin/users/super-admin';
import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import { searchPeople } from 'meteor/idreesia-common/server/business-logic/common/people/search-people';

interface MehfilKarkunsUser {
  _id?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
}

/** Only the locations of the types that have features (mehfils) have karkuns. */
const isMehfil = (location: { type: OrgLocationType }) =>
  OrgLocationFeatureAllowedTypes.includes(location.type);

const forbidden = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } });

const storedPermissions = (permissions: string[]) => {
  const stored = orgLocationGroupPermissionKeys(
    permissions,
    OrgLocationFeatureKeys.MEHFIL_KARKUNS
  );
  return MehfilKarkunsPermissionValues.filter(permission =>
    stored.includes(permission)
  );
};

/**
 * What the user may do with a mehfil's karkuns: the permissions set for them
 * on the location, or every permission for a super-admin. Throws FORBIDDEN
 * when they have none, or when the location is not a mehfil. A location the
 * caller has no part in answers the same, so its existence isn't revealed.
 */
export async function loadMehfilKarkunsAccess(
  user: MehfilKarkunsUser | null | undefined,
  locationId: string
): Promise<MehfilKarkunsPermission[]> {
  if (!user?._id || user.locked) {
    throw forbidden('You do not have access to this location.');
  }

  const location = await OrgLocations.findOneAsync({ _id: locationId });
  if (!location || !isMehfil(location)) {
    throw forbidden('You do not have access to this location.');
  }
  if (isSuperAdmin(user)) return MehfilKarkunsPermissionValues;

  const entry = await OrgLocationUsers.findOneAsync({
    locationId,
    userId: user._id,
  });
  const permissions = entry ? storedPermissions(entry.permissions) : [];
  if (permissions.length === 0) {
    throw forbidden('You do not have access to this location.');
  }
  return permissions;
}

export interface MyMehfilKarkunsLocation {
  locationId: string;
  name: string;
  type: string;
  parentId: string | null;
  /**
   * True for a location whose karkuns the user can see. The others are its
   * ancestors, listed so the locations can be shown in their hierarchy.
   */
  hasWorkspace: boolean;
  permissions: MehfilKarkunsPermission[];
}

/**
 * The mehfils whose karkuns the user can see: the ones where they hold a
 * Mehfil Karkuns permission, or every one for a super-admin. Their ancestors
 * are listed too, without access.
 */
export async function listMyMehfilKarkunsLocations(
  user: MehfilKarkunsUser | null | undefined
): Promise<MyMehfilKarkunsLocation[]> {
  if (!user?._id || user.locked) return [];

  const superAdmin = isSuperAdmin(user);
  const permissionsByLocation = new Map<string, MehfilKarkunsPermission[]>();
  if (!superAdmin) {
    const entries = await OrgLocationUsers.find({
      userId: user._id,
    }).fetchAsync();
    entries.forEach(entry => {
      const permissions = storedPermissions(entry.permissions);
      if (permissions.length > 0) {
        permissionsByLocation.set(entry.locationId, permissions);
      }
    });
    if (permissionsByLocation.size === 0) return [];
  }

  const locations = await OrgLocations.find({
    type: { $in: OrgLocationFeatureAllowedTypes },
    ...(superAdmin ? {} : { _id: { $in: [...permissionsByLocation.keys()] } }),
  }).fetchAsync();
  if (locations.length === 0) return [];

  const ancestorIds = new Set<string>();
  locations.forEach(location =>
    (location.allParentIds ?? []).forEach(id => ancestorIds.add(id))
  );
  const ancestors = ancestorIds.size
    ? await OrgLocations.find({ _id: { $in: [...ancestorIds] } }).fetchAsync()
    : [];

  const toItem = (
    location: (typeof locations)[number],
    hasWorkspace: boolean
  ): MyMehfilKarkunsLocation => ({
    locationId: location._id as string,
    name: location.name,
    type: location.type,
    parentId: location.parentId ?? null,
    hasWorkspace,
    permissions: !hasWorkspace
      ? []
      : superAdmin
        ? MehfilKarkunsPermissionValues
        : (permissionsByLocation.get(location._id as string) ?? []),
  });

  const withWorkspace = new Set(locations.map(location => location._id));
  return [
    ...locations.map(location => toItem(location, true)),
    ...ancestors
      .filter(location => !withWorkspace.has(location._id))
      .map(location => toItem(location, false)),
  ].sort((left, right) => left.name.localeCompare(right.name));
}

interface PersonDocument {
  _id: string;
  sharedData?: {
    name?: string;
    parentName?: string;
    cnicNumber?: string;
    contactNumber1?: string;
    contactNumber2?: string;
    imageKey?: string;
    imageThumbnailKey?: string;
  };
}

export interface MehfilKarkunsListParams {
  locationId: string;
  name?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

/**
 * The karkuns (not other kinds of people) whose mehfil is the location, a page
 * at a time, with only the fields the list shows.
 */
export async function listMehfilKarkuns(params: MehfilKarkunsListParams) {
  const result = (await searchPeople(
    {
      name: params.name ?? undefined,
      pageIndex: params.pageIndex ?? undefined,
      pageSize: params.pageSize ?? undefined,
      mehfilLocationId: params.locationId,
    },
    { includeKarkuns: true }
  )) as { data: PersonDocument[]; totalResults: number };

  return {
    data: result.data.map(person => ({
      _id: person._id,
      name: person.sharedData?.name,
      parentName: person.sharedData?.parentName,
      cnicNumber: person.sharedData?.cnicNumber,
      contactNumber1: person.sharedData?.contactNumber1,
      contactNumber2: person.sharedData?.contactNumber2,
      ...getPersonImageUrls(person.sharedData),
    })),
    totalResults: result.totalResults,
  };
}
