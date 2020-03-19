import { get } from 'meteor/idreesia-common/utilities/lodash';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { City as CitySchema } from 'meteor/idreesia-common/server/schemas/outstation';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { CityMehfils } from 'meteor/idreesia-common/server/collections/outstation';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

class Cities extends AggregatableCollection {
  constructor(name = 'outstation-cities', options = {}) {
    const cities = super(name, options);
    cities.attachSchema(CitySchema);
    return cities;
  }

  getMultanCity() {
    return this.findOne({
      name: 'Multan',
      country: 'Pakistan',
    });
  }
  // **************************************************************
  // Query Functions
  // **************************************************************
  searchCities(params) {
    const pipeline = [];

    const {
      peripheryOf,
      region,
      portalId,
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

    if (portalId) {
      const portal = Portals.findOne(portalId);
      pipeline.push({
        $match: {
          _id: { $in: portal.cityIds },
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

    const cities = this.aggregate(resultsPipeline).toArray();
    const totalResults = this.aggregate(countingPipeline).toArray();

    return Promise.all([cities, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }

  // **************************************************************
  // Utility Functions
  // **************************************************************
  canSafelyDeleteCity(cityId) {
    // Check that there are no mehfils associated with this city
    const cityMehfil = CityMehfils.findOne({ cityId });
    if (cityMehfil) return false;

    // Check that there are currently no karkuns assigned to this city
    const karkun = Karkuns.findOne({ cityId });
    if (karkun) return false;

    return true;
  }
}

export default new Cities();
