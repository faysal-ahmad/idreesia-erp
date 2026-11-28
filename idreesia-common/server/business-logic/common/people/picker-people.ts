import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations, Users } from 'meteor/idreesia-common/server/collections/admin';

import { getPersonImageUrls } from '../person-images';
import { searchPeople, type SearchPeopleFlags } from './search-people';

type LooseRecord = Record<string, any>;

/** What a person picker searches by, and the page it wants. */
export interface PickerPeopleParams {
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

/**
 * Who a picker may list: the people search filters and flags that the use case
 * fixes on the server (a city, a mehfil, having a user account, ...).
 */
export interface PickerPeopleScope {
  filter?: LooseRecord;
  flags: SearchPeopleFlags;
  /** Also mark each person with whether they have a user account. */
  markUserAccounts?: boolean;
}

/** The fields a person picker shows for a row. */
export interface PickerPerson {
  _id: string;
  name?: string | null;
  parentName?: string | null;
  cnicNumber?: string | null;
  contactNumber1?: string | null;
  imageUrl: string | null;
  imageThumbnailUrl: string | null;
  hasUserAccount?: boolean;
}

export interface PagedPickerPeople {
  data: PickerPerson[];
  totalResults: number;
}

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

/**
 * The Multan city in the organization tree (under Pakistan), where the HR
 * karkuns belong; null when it is missing.
 */
export async function findMultanCityLocation() {
  const pakistan = await OrgLocations.findOneAsync({
    name: 'Pakistan',
    type: OrgLocationTypes.COUNTRY,
  });
  if (!pakistan) return null;
  const city = await OrgLocations.findOneAsync({
    name: 'Multan',
    type: OrgLocationTypes.CITY,
    allParentIds: pakistan._id,
  });
  return city ?? null;
}

export const NO_PICKER_PEOPLE: PagedPickerPeople = { data: [], totalResults: 0 };

/** A person with only the fields needed to pick them. */
export function toPickerPerson(person: PersonDocument): PickerPerson {
  return {
    _id: person._id,
    name: person.sharedData?.name,
    parentName: person.sharedData?.parentName,
    cnicNumber: person.sharedData?.cnicNumber,
    contactNumber1: person.sharedData?.contactNumber1,
    ...getPersonImageUrls(person.sharedData),
  };
}

/**
 * A page of the people in the scope who match what was typed, with only the
 * fields needed to pick a person. Every person picker search goes through this,
 * so they all return the same shape.
 */
export async function searchPickerPeople(
  params: PickerPeopleParams,
  scope: PickerPeopleScope
): Promise<PagedPickerPeople> {
  const result = (await searchPeople(
    {
      ...scope.filter,
      name: params.name ?? undefined,
      cnicNumber: params.cnicNumber ?? undefined,
      phoneNumber: params.phoneNumber ?? undefined,
      pageIndex: params.pageIndex ?? undefined,
      pageSize: params.pageSize ?? undefined,
    },
    scope.flags
  )) as { data: PersonDocument[]; totalResults: number };

  const data = result.data.map(toPickerPerson);
  if (!scope.markUserAccounts || data.length === 0) {
    return { data, totalResults: result.totalResults };
  }

  const users = await Users.find(
    { personId: { $in: data.map(person => person._id) } },
    { projection: { personId: 1 } }
  ).fetchAsync();
  const withAccount = new Set(users.map(user => user.personId));

  return {
    data: data.map(person => ({
      ...person,
      hasUserAccount: withAccount.has(person._id),
    })),
    totalResults: result.totalResults,
  };
}
