import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import { searchPeople } from 'meteor/idreesia-common/server/business-logic/common/people/search-people';

export interface HrPermissionKarkunSearchParams {
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

/**
 * The karkuns who have an unlocked user account (a permission or a group belongs to a
 * user), with only the fields needed to pick a person.
 */
export async function searchHrPermissionKarkuns(params: HrPermissionKarkunSearchParams) {
  const result = (await searchPeople(
    {
      name: params.name ?? undefined,
      cnicNumber: params.cnicNumber ?? undefined,
      phoneNumber: params.phoneNumber ?? undefined,
      pageIndex: params.pageIndex ?? undefined,
      pageSize: params.pageSize ?? undefined,
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
