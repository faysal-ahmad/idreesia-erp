import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import {
  PURCHASING_KARKUN_CITY,
  PurchasingPermissionCatalog,
} from 'meteor/idreesia-common/constants/purchasing';
import { OrgLocations, UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  NO_PICKER_PEOPLE,
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

export type KarkunSearchParams = PickerPeopleParams;

async function findPurchasingCity() {
  return OrgLocations.findOneAsync({
    type: OrgLocationTypes.CITY,
    name: { $regex: new RegExp(`^${escapeRegExp(PURCHASING_KARKUN_CITY)}$`, 'i') },
  });
}

/**
 * The karkuns of the Purchasing city who have an unlocked user account (a permission or
 * a group belongs to a user), with only the fields needed to pick a person.
 * Nobody is found when the city location does not exist.
 */
export async function searchPurchasingKarkuns(params: KarkunSearchParams) {
  const city = await findPurchasingCity();
  if (!city) return NO_PICKER_PEOPLE;

  return searchPickerPeople(params, {
    filter: { cityLocationId: city._id as string, userAccount: 'active' },
    flags: { includeKarkuns: true },
  });
}

/**
 * The karkuns of the Purchasing city, with or without a user account, to name
 * who requested or received goods on a form. Nobody is found when the city
 * location does not exist.
 */
export async function searchPurchasingFormKarkuns(params: KarkunSearchParams) {
  const city = await findPurchasingCity();
  if (!city) return NO_PICKER_PEOPLE;

  return searchPickerPeople(params, {
    filter: { cityLocationId: city._id as string },
    flags: { includeKarkuns: true },
  });
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
  if (personIds.length === 0) return NO_PICKER_PEOPLE;

  return searchPickerPeople(params, {
    filter: { personIds },
    flags: { includeKarkuns: true },
  });
}
