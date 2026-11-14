import {
  Cities,
  CityMehfils,
  type CityDocument,
} from 'meteor/idreesia-common/server/collections/outstation';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { get } from 'meteor/idreesia-common/utilities/lodash';

export interface SearchCitiesParams {
  peripheryOf?: string;
  region?: string;
  pageIndex?: string;
  pageSize?: string;
}

interface CountResult {
  total: number;
}

export function searchCities(params: SearchCitiesParams) {
  const pipeline: Record<string, unknown>[] = [];

  const { peripheryOf, region, pageIndex = '0', pageSize = '20' } = params;

  if (peripheryOf) {
    pipeline.push({
      $match: {
        peripheryOf: { $eq: peripheryOf },
      },
    });
  }

  if (region) {
    pipeline.push({
      $match: {
        region: { $eq: region },
      },
    });
  }

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { name: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const cities = Cities.aggregate<CityDocument>(resultsPipeline);
  const totalResults = Cities.aggregate<CountResult>(countingPipeline);

  return Promise.all([cities, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}

/** A city can be deleted when no mehfils and no karkuns refer to it. */
export async function canSafelyDeleteCity(cityId: string): Promise<boolean> {
  const cityMehfil = await CityMehfils.findOneAsync({ cityId });
  if (cityMehfil) return false;

  const karkun = await People.findOneAsync({ 'karkunData.cityId': cityId });
  if (karkun) return false;

  return true;
}
