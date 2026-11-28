import {
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';

/**
 * Karkuns and employees, from any city, that a user account can be linked to,
 * with only the fields needed to pick a person.
 */
export async function searchAdminUserKarkuns(params: PickerPeopleParams) {
  return searchPickerPeople(params, {
    flags: { includeKarkuns: true, includeEmployees: true },
  });
}
