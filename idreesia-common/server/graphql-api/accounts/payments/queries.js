import moment from 'moment';
import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Payments } from 'meteor/idreesia-common/server/collections/accounts';
import { Formats } from 'meteor/idreesia-common/constants';

export function getPayments(queryString) {
  const params = parse(queryString);
  const pipeline = [];
  console.log('::getPayments params = ', params);
  const {
    pageIndex = '0',
    pageSize = '20',
    name,
    cnicNumber,
    paymentType,
    paymentAmount,
    startDate,
    endDate,
    isDeleted,
  } = params;

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  if (name) {
    pipeline.push({
      $match: {
        name: { $eq: name },
      },
    });
  }
  if (isDeleted) {
    pipeline.push({
      $match: {
        isDeleted: { $eq: isDeleted },
      },
    });
  } else {
    pipeline.push({
      $match: {
        isDeleted: { $eq: false },
      },
    });
  }
  if (cnicNumber) {
    pipeline.push({
      $match: {
        cnicNumber: { $eq: cnicNumber },
      },
    });
  }
  if (paymentType) {
    pipeline.push({
      $match: {
        paymentType: { $eq: paymentType },
      },
    });
  }
  if (paymentAmount) {
    pipeline.push({
      $match: {
        paymentAmount: { $eq: parseFloat(paymentAmount) },
      },
    });
  }
  if (startDate) {
    pipeline.push({
      $match: {
        paymentDate: {
          $gte: moment(startDate, Formats.DATE_FORMAT)
            .startOf('day')
            .toDate(),
        },
      },
    });
  }
  if (endDate) {
    pipeline.push({
      $match: {
        paymentDate: {
          $lte: moment(endDate, Formats.DATE_FORMAT)
            .endOf('day')
            .toDate(),
        },
      },
    });
  }
  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { paymentDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  console.log(
    '::getPayments.resultsPipeline ',
    JSON.stringify(resultsPipeline)
  );
  const payments = Payments.aggregate(resultsPipeline).toArray();
  const totalResults = Payments.aggregate(countingPipeline).toArray();

  return Promise.all([payments, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
