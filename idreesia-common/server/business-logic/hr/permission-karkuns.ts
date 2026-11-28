import {
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';

export type HrPermissionKarkunSearchParams = PickerPeopleParams;

/**
 * The karkuns who have an unlocked user account (a permission or a group belongs to a
 * user), with only the fields needed to pick a person.
 */
export async function searchHrPermissionKarkuns(params: HrPermissionKarkunSearchParams) {
  return searchPickerPeople(params, {
    filter: { userAccount: 'active' },
    flags: { includeKarkuns: true },
  });
}
