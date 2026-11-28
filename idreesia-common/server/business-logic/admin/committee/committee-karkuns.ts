import {
  findMultanCityLocation,
  NO_PICKER_PEOPLE,
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';

/**
 * Karkuns a committee coordinator can add as members: the karkuns of Multan,
 * as in HR, with only the fields needed to pick a person. Nobody is found when
 * the Multan city location does not exist.
 */
export async function searchCommitteeKarkuns(params: PickerPeopleParams) {
  const city = await findMultanCityLocation();
  if (!city) return NO_PICKER_PEOPLE;

  return searchPickerPeople(params, {
    filter: { cityLocationId: city._id as string },
    flags: { includeKarkuns: true },
  });
}
