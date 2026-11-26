import {
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';

/**
 * Anyone (visitors, karkuns and employees) who can be put on a mehfil's duty,
 * with only the fields needed to pick a person.
 */
export async function searchSecurityMehfilPeople(params: PickerPeopleParams) {
  return searchPickerPeople(params, {
    flags: { includeVisitors: true, includeKarkuns: true, includeEmployees: true },
  });
}
