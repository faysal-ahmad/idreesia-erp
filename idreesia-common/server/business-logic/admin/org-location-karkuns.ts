import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations, Users } from 'meteor/idreesia-common/server/collections/admin';
import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import { searchPeople } from 'meteor/idreesia-common/server/business-logic/common/people/search-people';

interface PersonDocument {
  _id: string;
  sharedData?: {
    name?: string;
    parentName?: string;
    cnicNumber?: string;
    contactNumber1?: string;
    contactNumber2?: string;
    imageKey?: string;
    imageThumbnailKey?: string;
  };
}

export interface OrgLocationKarkunsParams {
  locationId: string;
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  /** Only the karkuns that have a user account. */
  withUserAccount?: boolean | null;
  /** Also the karkuns of the locations below it (cities, mehfils). */
  includeChildLocations?: boolean | null;
  pageIndex?: string | null;
  pageSize?: string | null;
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
async function getLocationFilter(params: OrgLocationKarkunsParams) {
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
export async function listOrgLocationKarkuns(params: OrgLocationKarkunsParams) {
  const locationFilter = await getLocationFilter(params);
  const result = (await searchPeople(
    {
      name: params.name ?? undefined,
      cnicNumber: params.cnicNumber ?? undefined,
      phoneNumber: params.phoneNumber ?? undefined,
      pageIndex: params.pageIndex ?? undefined,
      pageSize: params.pageSize ?? undefined,
      ...locationFilter,
      userAccount: params.withUserAccount ? 'true' : undefined,
    },
    { includeKarkuns: true }
  )) as { data: PersonDocument[]; totalResults: number };

  const users = await Users.find({
    personId: { $in: result.data.map(person => person._id) },
  }).fetchAsync();
  const withAccount = new Set(users.map(user => user.personId));

  return {
    data: result.data.map(person => ({
      _id: person._id,
      name: person.sharedData?.name,
      parentName: person.sharedData?.parentName,
      cnicNumber: person.sharedData?.cnicNumber,
      contactNumber1: person.sharedData?.contactNumber1,
      contactNumber2: person.sharedData?.contactNumber2,
      hasUserAccount: withAccount.has(person._id),
      ...getPersonImageUrls(person.sharedData),
    })),
    totalResults: result.totalResults,
  };
}
