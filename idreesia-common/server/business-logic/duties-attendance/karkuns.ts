import {
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';

export interface WorkspaceKarkunSearchParams extends PickerPeopleParams {
  /** The mehfil whose duties the karkuns are for: only its karkuns are listed. */
  locationId: string;
}

/**
 * Karkuns to choose from when building a duty roster, with only the fields
 * needed to pick a person. Only karkuns (not other kinds of people) whose
 * mehfil is the location are listed.
 */
export async function searchWorkspaceKarkuns({
  locationId,
  ...params
}: WorkspaceKarkunSearchParams) {
  return searchPickerPeople(params, {
    filter: { mehfilLocationId: locationId },
    flags: { includeKarkuns: true },
  });
}
