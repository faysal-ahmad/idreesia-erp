import { parse } from 'query-string';
import { get } from 'lodash';
import moment from 'moment';

import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';

export default function getPagedStockItems(queryString, physicalStoreId) {
  const params = parse(queryString);
  const {
    categoryId,
    name,
    stockLevel,
    verifyDuration,
    pageIndex = '0',
    pageSize = '20',
  } = params;
  const pipeline = [];

  if (name) {
    if (name.length === 1) {
      pipeline.push({
        $match: { name: { $regex: `^${name}` } },
      });
    } else {
      pipeline.push({
        $match: { $text: { $search: name } },
      });
    }
  }

  pipeline.push({
    $match: {
      physicalStoreId: { $eq: physicalStoreId },
    },
  });

  if (categoryId) {
    pipeline.push({
      $match: {
        categoryId: { $eq: categoryId },
      },
    });
  }

  if (verifyDuration === 'less-than-3-months-ago') {
    const m3 = moment()
      .subtract(3, 'months')
      .toDate();
    pipeline.push({
      $match: {
        $and: [{ verifiedOn: { $ne: null } }, { verifiedOn: { $gt: m3 } }],
      },
    });
  } else if (verifyDuration === 'between-3-to-6-months-ago') {
    const m3 = moment()
      .subtract(3, 'months')
      .toDate();
    const m6 = moment()
      .subtract(6, 'months')
      .toDate();
    pipeline.push({
      $match: {
        $and: [
          { verifiedOn: { $ne: null } },
          { verifiedOn: { $gt: m6 } },
          { verifiedOn: { $lt: m3 } },
        ],
      },
    });
  } else if (verifyDuration === 'more-than-6-months-ago') {
    const m6 = moment()
      .subtract(6, 'months')
      .toDate();
    pipeline.push({
      $match: {
        $or: [{ verifiedOn: { $eq: null } }, { verifiedOn: { $lt: m6 } }],
      },
    });
  }

  if (stockLevel === 'negative-stock-level') {
    pipeline.push({
      $match: {
        currentStockLevel: { $lt: 0 },
      },
    });
  } else if (stockLevel === 'less-than-min-stock-level') {
    pipeline.push({
      $match: {
        minStockLevel: { $ne: null },
        $expr: { $gt: ['$minStockLevel', '$currentStockLevel'] },
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

  const stockItems = StockItems.aggregate(resultsPipeline).toArray();
  const totalResults = StockItems.aggregate(countingPipeline).toArray();
  return Promise.all([stockItems, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
