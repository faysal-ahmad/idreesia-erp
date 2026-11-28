import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import {
  findMultanCityLocation,
  NO_PICKER_PEOPLE,
  searchPickerPeople,
  type PickerPeopleParams,
} from 'meteor/idreesia-common/server/business-logic/common/people/picker-people';

export interface OrgLocationKarkunsParams extends PickerPeopleParams {
  locationId: string;
  /** Only the karkuns that have a user account. */
  withUserAccount?: boolean | null;
  /** Also the karkuns of the locations below it (cities, mehfils). */
  includeChildLocations?: boolean | null;
}

/**
 * The ids of the location and every location below it, or null for the root:
 * everyone is under it, including karkuns with no location.
 */
async function getLocationSubtreeIds(locationId: string) {
  const location = await OrgLocations.findOneAsync(locationId);
  if (location?.type === OrgLocationTypes.ROOT) return null;
  const children = await OrgLocations.find(
    { allParentIds: locationId },
    { fields: { _id: 1 } }
  ).fetchAsync();
  return [locationId, ...children.map(child => child._id as string)];
}

/** How the search narrows to the location (and, if asked, those below it). */
async function getLocationFilter(
  params: Pick<OrgLocationKarkunsParams, 'locationId' | 'includeChildLocations'>
) {
  if (!params.includeChildLocations) {
    return { mehfilLocationId: params.locationId };
  }
  const subtreeIds = await getLocationSubtreeIds(params.locationId);
  return subtreeIds ? { locationIds: subtreeIds } : {};
}

/**
 * The karkuns whose mehfil is the location, or with `includeChildLocations`
 * of it or any location below it, a page at a time, each marked with whether
 * they already have a user account.
 */
export async function listOrgLocationKarkuns({
  locationId,
  withUserAccount,
  includeChildLocations,
  ...params
}: OrgLocationKarkunsParams) {
  const locationFilter = await getLocationFilter({ locationId, includeChildLocations });
  return searchPickerPeople(params, {
    filter: {
      ...locationFilter,
      userAccount: withUserAccount ? 'true' : undefined,
    },
    flags: { includeKarkuns: true },
    markUserAccounts: true,
  });
}

/**
 * Karkuns who can be made observers of a location: the karkuns of Multan, as
 * in HR, with only the fields needed to pick a person.
 */
export async function searchOrgLocationObserverKarkuns(params: PickerPeopleParams) {
  const city = await findMultanCityLocation();
  if (!city) return NO_PICKER_PEOPLE;

  return searchPickerPeople(params, {
    filter: { cityLocationId: city._id as string },
    flags: { includeKarkuns: true },
  });
}
