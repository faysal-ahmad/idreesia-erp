import { get } from 'meteor/idreesia-common/utilities/lodash';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { City as CitySchema } from 'meteor/idreesia-common/server/schemas/outstation';
import { CityMehfils } from 'meteor/idreesia-common/server/collections/outstation';
import { People } from 'meteor/idreesia-common/server/collections/common';

interface CityDocument {
  _id?: string;
  name?: string;
  country?: string;
  peripheryOf?: string;
  region?: string;
  [key: string]: unknown;
}

interface SearchCitiesParams {
  peripheryOf?: string;
  region?: string;
  pageIndex?: string;
  pageSize?: string;
}

interface CountResult {
  total: number;
}

class Cities extends AggregatableCollection<CityDocument> {
  constructor(name = 'outstation-cities', options = {}) {
    super(name, options);
    this.attachSchema(CitySchema);
  }

  getMultanCity() {
    return this.findOneAsync({
      name: 'Multan',
      country: 'Pakistan',
    });
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  searchCities(params: SearchCitiesParams) {
    const pipeline: Record<string, unknown>[] = [];

    const {
      peripheryOf,
      region,
      pageIndex = '0',
      pageSize = '20',
    } = params;

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

    const cities = this.aggregate<CityDocument>(resultsPipeline);
    const totalResults = this.aggregate<CountResult>(countingPipeline);

    return Promise.all([cities, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }

  // **************************************************************
  // Utility Functions
  // **************************************************************
  async canSafelyDeleteCity(cityId: string) {
    // Check that there are no mehfils associated with this city
    const cityMehfil = await CityMehfils.findOneAsync({ cityId });
    if (cityMehfil) return false;

    // Check that there are currently no karkuns assigned to this city
    const karkun = await People.findOneAsync({ 'karkunData.cityId': cityId });
    if (karkun) return false;

    return true;
  }
}

export default new Cities();
