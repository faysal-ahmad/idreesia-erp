import {
  findMultanCityLocation,
  NO_PICKER_PEOPLE,
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';

/**
 * The karkuns of Multan (where the HR karkuns belong), to add to a team or a
 * day's duty, with only the fields needed to pick a person.
 */
export async function searchHrPickerKarkuns(params: PickerPeopleParams) {
  const city = await findMultanCityLocation();
  if (!city) return NO_PICKER_PEOPLE;

  return searchPickerPeople(params, {
    filter: { cityLocationId: city._id as string },
    flags: { includeKarkuns: true },
  });
}

/**
 * Karkuns of Multan who are not employees yet, to make an employee, with only
 * the fields needed to pick a person.
 */
export async function searchHrEmployeeCandidateKarkuns(params: PickerPeopleParams) {
  const city = await findMultanCityLocation();
  if (!city) return NO_PICKER_PEOPLE;

  return searchPickerPeople(params, {
    filter: { cityLocationId: city._id as string },
    flags: { includeKarkuns: true, includeEmployees: false },
  });
}

/**
 * People who are not karkuns yet (visitors and employees), to make a karkun,
 * with only the fields needed to pick a person.
 */
export async function searchHrKarkunCandidatePeople(params: PickerPeopleParams) {
  return searchPickerPeople(params, { flags: { includeKarkuns: false } });
}
