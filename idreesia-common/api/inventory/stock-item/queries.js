import { parse } from 'query-string';
import { StockItems } from 'meteor/idreesia-common/collections/inventory';
import { get } from 'lodash';

export default function getPagedStockItems(queryString, physicalStoreId) {
  const params = parse(queryString);
  const { categoryId, name, pageIndex = '0', pageSize = '20' } = params;
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
