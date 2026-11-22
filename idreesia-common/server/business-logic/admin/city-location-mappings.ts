import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  CityLocationMappings,
  OrgLocations,
} from 'meteor/idreesia-common/server/collections/admin';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { pagedFreeFormValues } from 'meteor/idreesia-common/server/business-logic/common/people/free-form-data';

interface UserRef {
  _id: string;
}

export interface FreeFormCityValue {
  name: string;
  count: number;
  locationId: string | null;
  locationName: string | null;
}

export interface FreeFormCitiesPage {
  totalResults: number;
  data: FreeFormCityValue[];
}

/**
 * A page of the free-form visitor cities (see `pagedFreeFormValues`), each
 * with the organization location it is mapped to, if any.
 */
export async function pagedFreeFormCities(
  pageIndex: number,
  pageSize: number
): Promise<FreeFormCitiesPage> {
  const page = await pagedFreeFormValues('city', pageIndex, pageSize);
  const mappings = await CityLocationMappings.find({
    city: { $in: page.data.map(row => row.name) },
  }).fetchAsync();
  const locations = await OrgLocations.find(
    { _id: { $in: mappings.map(mapping => mapping.locationId) } },
    { fields: { name: 1 } }
  ).fetchAsync();

  const locationNameById = new Map(
    locations.map(location => [location._id, location.name])
  );
  const locationIdByCity = new Map(
    mappings.map(mapping => [mapping.city, mapping.locationId])
  );

  return {
    totalResults: page.totalResults,
    data: page.data.map(row => {
      const locationId = locationIdByCity.get(row.name) ?? null;
      return {
        ...row,
        locationId,
        locationName: locationId
          ? (locationNameById.get(locationId) ?? null)
          : null,
      };
    }),
  };
}

/**
 * Maps every free-form visitor city that has no mapping yet to the
 * city-type organization location whose name is an exact (case-sensitive)
 * match; only cities are ever matched. A city with no match, or with several
 * cities of that name, is left unmapped;
 * existing mappings are never changed. Returns the number of mappings added.
 */
export async function updateCityLocationMappings(
  user: UserRef
): Promise<number> {
  return runInTransaction(async () => {
    const cities = (
      (await (
        People.rawCollection() as unknown as {
          distinct(field: string, filter: object): Promise<unknown[]>;
        }
      ).distinct('visitorData.city', { deletedAt: { $exists: false } })) ?? []
    ).filter((city): city is string => typeof city === 'string' && city !== '');

    const mapped = new Set(
      (
        await CityLocationMappings.find(
          {},
          { fields: { city: 1 } }
        ).fetchAsync()
      ).map(mapping => mapping.city)
    );
    const unmapped = cities.filter(city => !mapped.has(city));
    if (unmapped.length === 0) return 0;

    const locations = await OrgLocations.find(
      { name: { $in: unmapped }, type: OrgLocationTypes.CITY },
      { fields: { name: 1 } }
    ).fetchAsync();

    const locationsByName = new Map<string, string[]>();
    locations.forEach(location => {
      const ids = locationsByName.get(location.name) ?? [];
      ids.push(location._id as string);
      locationsByName.set(location.name, ids);
    });

    const date = new Date();
    let added = 0;
    for (const city of unmapped) {
      const ids = locationsByName.get(city);
      if (ids?.length === 1) {
        await CityLocationMappings.insertAsync({
          city,
          locationId: ids[0],
          createdAt: date,
          createdBy: user._id,
          updatedAt: date,
          updatedBy: user._id,
        });
        added += 1;
      }
    }
    return added;
  });
}
