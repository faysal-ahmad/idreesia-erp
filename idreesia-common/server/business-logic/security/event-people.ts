import {
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';

/**
 * Karkuns from any city who can be put on an event's duty, with only the
 * fields needed to pick a person.
 */
export async function searchSecurityEventPeople(params: PickerPeopleParams) {
  return searchPickerPeople(params, {
    flags: { includeKarkuns: true },
  });
}
