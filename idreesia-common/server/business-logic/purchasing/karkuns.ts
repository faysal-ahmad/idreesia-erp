import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import {
  PURCHASING_KARKUN_CITY,
  PurchasingPermissionCatalog,
} from 'meteor/idreesia-common/constants/purchasing';
import { OrgLocations, UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import { searchPeople } from 'meteor/idreesia-common/server/business-logic/common/people/search-people';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

export interface KarkunSearchParams {
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

/**
 * The karkuns of the Purchasing city who have an unlocked user account (a permission or
 * a group belongs to a user), with only the fields needed to pick a person.
 * Nobody is found when the city location does not exist.
 */
export async function searchPurchasingKarkuns(params: KarkunSearchParams) {
  const city = await OrgLocations.findOneAsync({
    type: OrgLocationTypes.CITY,
    name: { $regex: new RegExp(`^${escapeRegExp(PURCHASING_KARKUN_CITY)}$`, 'i') },
  });
  if (!city) return { data: [], totalResults: 0 };

  const result = (await searchPeople(
    {
      name: params.name ?? undefined,
      cnicNumber: params.cnicNumber ?? undefined,
      phoneNumber: params.phoneNumber ?? undefined,
      pageIndex: params.pageIndex ?? undefined,
      pageSize: params.pageSize ?? undefined,
      cityLocationId: city._id as string,
      userAccount: 'active',
    },
    { includeKarkuns: true }
  )) as {
    data: Array<{ _id: string; sharedData?: Record<string, any> }>;
    totalResults: number;
  };

  return {
    data: result.data.map((person) => ({
      _id: person._id,
      name: person.sharedData?.name,
      parentName: person.sharedData?.parentName,
      cnicNumber: person.sharedData?.cnicNumber,
      contactNumber1: person.sharedData?.contactNumber1,
      ...getPersonImageUrls(person.sharedData as any),
    })),
    totalResults: result.totalResults,
  };
}

const PURCHASING_PERMISSION_KEYS = PurchasingPermissionCatalog.flatMap((group) =>
  group.permissions.map((permission) => permission.key)
);

/**
 * The karkuns who hold at least one Purchasing permission, given to their
 * user account or through a user group (any group that grants one). Locked
 * accounts and super admins are left out, as on the Permissions page.
 */
export async function searchPurchasingPermissionHolders(params: KarkunSearchParams) {
  const grantingGroups = await UserGroups.find(
    { permissions: { $in: PURCHASING_PERMISSION_KEYS } },
    { projection: { _id: 1 } }
  ).fetchAsync();
  const holders = await Users.find({
    locked: { $ne: true },
    isSuperAdmin: { $ne: true },
    personId: { $exists: true },
    $or: [
      { permissions: { $in: PURCHASING_PERMISSION_KEYS } },
      { groups: { $in: grantingGroups.map((g) => g._id as string) } },
    ],
  }).fetchAsync();
  const personIds = [...new Set(holders.map((u) => u.personId).filter(Boolean))] as string[];
  if (personIds.length === 0) return { data: [], totalResults: 0 };

  const result = (await searchPeople(
    {
      name: params.name ?? undefined,
      cnicNumber: params.cnicNumber ?? undefined,
      phoneNumber: params.phoneNumber ?? undefined,
      pageIndex: params.pageIndex ?? undefined,
      pageSize: params.pageSize ?? undefined,
      personIds,
    },
    { includeKarkuns: true }
  )) as {
    data: Array<{ _id: string; sharedData?: Record<string, any> }>;
    totalResults: number;
  };

  return {
    data: result.data.map((person) => ({
      _id: person._id,
      name: person.sharedData?.name,
      parentName: person.sharedData?.parentName,
      cnicNumber: person.sharedData?.cnicNumber,
      contactNumber1: person.sharedData?.contactNumber1,
      ...getPersonImageUrls(person.sharedData as any),
    })),
    totalResults: result.totalResults,
  };
}
