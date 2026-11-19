import { getPersonImageUrls } from 'meteor/idreesia-common/server/business-logic/common/person-images';
import { searchPeople } from 'meteor/idreesia-common/server/business-logic/common/people/search-people';

interface PersonDocument {
  _id: string;
  sharedData?: {
    name?: string;
    parentName?: string;
    cnicNumber?: string;
    contactNumber1?: string;
    imageKey?: string;
    imageThumbnailKey?: string;
  };
}

export interface WorkspaceKarkunSearchParams {
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

/**
 * Karkuns to choose from when building a duty roster, with only the fields
 * needed to pick a person.
 */
export async function searchWorkspaceKarkuns(
  params: WorkspaceKarkunSearchParams
) {
  const result = (await searchPeople(
    {
      name: params.name ?? undefined,
      cnicNumber: params.cnicNumber ?? undefined,
      phoneNumber: params.phoneNumber ?? undefined,
      pageIndex: params.pageIndex ?? undefined,
      pageSize: params.pageSize ?? undefined,
    },
    { includeKarkuns: true }
  )) as { data: PersonDocument[]; totalResults: number };

  return {
    data: result.data.map(person => ({
      _id: person._id,
      name: person.sharedData?.name,
      parentName: person.sharedData?.parentName,
      cnicNumber: person.sharedData?.cnicNumber,
      contactNumber1: person.sharedData?.contactNumber1,
      ...getPersonImageUrls(person.sharedData),
    })),
    totalResults: result.totalResults,
  };
}
