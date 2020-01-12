import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { PaymentsHistory } from 'meteor/idreesia-common/server/collections/accounts';

export function getPaymentsHistory(queryString) {
  const params = parse(queryString);
  const pipeline = [];
  const { pageIndex = '0', pageSize = '20', paymentId } = params;
  pipeline.push({
    $match: {
      paymentId: { $eq: paymentId },
    },
  });
  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { version: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const payments = PaymentsHistory.aggregate(resultsPipeline).toArray();
  const totalResults = PaymentsHistory.aggregate(countingPipeline).toArray();

  return Promise.all([payments, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
