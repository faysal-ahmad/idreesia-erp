import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Wazeefa as WazeefaSchema } from 'meteor/idreesia-common/server/schemas/wazaif-management';
import { get } from 'meteor/idreesia-common/utilities/lodash';

class Wazaif extends AggregatableCollection {
  constructor(name = 'wazaif-management-wazaif', options = {}) {
    const wazaif = super(name, options);
    wazaif.attachSchema(WazeefaSchema);
    return wazaif;
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  searchWazaif(params = {}) {
    const pipeline = [];

    const { name, pageIndex = '0', pageSize = '20' } = params;

    if (name) {
      pipeline.push({
        $match: {
          name: { $eq: name },
        },
      });
    }

    const countingPipeline = pipeline.concat({
      $count: 'total',
    });

    const nPageIndex = parseInt(pageIndex, 10);
    const nPageSize = parseInt(pageSize, 10);
    const resultsPipeline = pipeline.concat([
      { $sort: { name: 1 } },
      { $skip: nPageIndex * nPageSize },
      { $limit: nPageSize },
    ]);

    const wazaif = this.aggregate(resultsPipeline).toArray();
    const totalResults = this.aggregate(countingPipeline).toArray();

    return Promise.all([wazaif, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }
}

export default new Wazaif();
