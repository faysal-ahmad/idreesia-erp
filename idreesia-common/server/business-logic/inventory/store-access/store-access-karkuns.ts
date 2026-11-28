import {
  findMultanCityLocation,
  NO_PICKER_PEOPLE,
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';

export type StoreAccessKarkunSearchParams = PickerPeopleParams;

/**
 * The karkuns of Multan who have an unlocked user account, for the Add User
 * drawers of Stores / Manage Stores (store permissions and user groups). Nobody is found when the Multan city
 * location does not exist.
 */
export async function searchStorePermissionKarkuns(
  params: StoreAccessKarkunSearchParams
) {
  const city = await findMultanCityLocation();
  if (!city) return NO_PICKER_PEOPLE;

  return searchPickerPeople(params, {
    filter: { cityLocationId: city._id as string, userAccount: 'active' },
    flags: { includeKarkuns: true },
  });
}
