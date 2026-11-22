import { Users } from 'meteor/idreesia-common/server/collections/admin';
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
  pageIndex?: string | null;
  pageSize?: string | null;
}

/**
 * The karkuns whose mehfil is the location, a page at a time, each marked with
 * whether they already have a user account.
 */
export async function listOrgLocationKarkuns(params: OrgLocationKarkunsParams) {
  const result = (await searchPeople(
    {
      name: params.name ?? undefined,
      cnicNumber: params.cnicNumber ?? undefined,
      phoneNumber: params.phoneNumber ?? undefined,
      pageIndex: params.pageIndex ?? undefined,
      pageSize: params.pageSize ?? undefined,
      mehfilLocationId: params.locationId,
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
