import {
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';

export type SecurityPermissionKarkunSearchParams = PickerPeopleParams;

/**
 * The karkuns who have an unlocked user account (a permission or a group belongs to a
 * user), with only the fields needed to pick a person.
 */
export async function searchSecurityPermissionKarkuns(params: SecurityPermissionKarkunSearchParams) {
  return searchPickerPeople(params, {
    filter: { userAccount: 'active' },
    flags: { includeKarkuns: true },
  });
}
