import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { PURCHASING_KARKUN_CITY } from 'meteor/idreesia-common/constants/purchasing';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import { searchPeople } from 'meteor/idreesia-common/server/business-logic/common/people/search-people';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

export interface KarkunSearchParams {
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

/**
 * The karkuns of the Purchasing city who have an unlocked user account (a permission or
 * a group belongs to a user), with only the fields needed to pick a person.
 * Nobody is found when the city location does not exist.
 */
export async function searchPurchasingKarkuns(params: KarkunSearchParams) {
  const city = await OrgLocations.findOneAsync({
    type: OrgLocationTypes.CITY,
    name: { $regex: new RegExp(`^${escapeRegExp(PURCHASING_KARKUN_CITY)}$`, 'i') },
  });
  if (!city) return { data: [], totalResults: 0 };

  const result = (await searchPeople(
    {
      name: params.name ?? undefined,
      cnicNumber: params.cnicNumber ?? undefined,
      phoneNumber: params.phoneNumber ?? undefined,
      pageIndex: params.pageIndex ?? undefined,
      pageSize: params.pageSize ?? undefined,
      cityLocationId: city._id as string,
      userAccount: 'active',
    },
    { includeKarkuns: true }
  )) as {
    data: Array<{ _id: string; sharedData?: Record<string, any> }>;
    totalResults: number;
  };

  return {
    data: result.data.map((person) => ({
      _id: person._id,
      name: person.sharedData?.name,
      parentName: person.sharedData?.parentName,
      cnicNumber: person.sharedData?.cnicNumber,
      contactNumber1: person.sharedData?.contactNumber1,
      ...getPersonImageUrls(person.sharedData as any),
    })),
    totalResults: result.totalResults,
  };
}
