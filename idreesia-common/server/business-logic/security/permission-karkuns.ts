import {
  findMultanCityLocation,
  NO_PICKER_PEOPLE,
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';

export type SecurityPermissionKarkunSearchParams = PickerPeopleParams;

/**
 * The karkuns of Multan who have an unlocked user account (a permission or a group
 * belongs to a user), with only the fields needed to pick a person. Nobody is found
 * when the Multan city location does not exist.
 */
export async function searchSecurityPermissionKarkuns(params: SecurityPermissionKarkunSearchParams) {
  const city = await findMultanCityLocation();
  if (!city) return NO_PICKER_PEOPLE;

  return searchPickerPeople(params, {
    filter: { cityLocationId: city._id as string, userAccount: 'active' },
    flags: { includeKarkuns: true },
  });
}
