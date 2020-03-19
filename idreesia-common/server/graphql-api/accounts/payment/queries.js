import moment from 'moment';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Payments } from 'meteor/idreesia-common/server/collections/accounts';
import { Formats } from 'meteor/idreesia-common/constants';

async function getPaymentIdsByNameSearch(name) {
  const pipeline = [
    { $match: { $text: { $search: name } } },
    { $sort: { score: { $meta: 'textScore' } } },
    { $limit: 50 },
  ];

  const payments = await Payments.aggregate(pipeline).toArray();
  return payments.map(({ _id }) => _id);
}

export async function getPayments(params) {
  const pipeline = [];
  const {
    pageIndex = '0',
    pageSize = '20',
    paymentNumber,
    name,
    cnicNumber,
    paymentTypeId,
    startDate,
    endDate,
    isDeleted,
  } = params;

  if (name) {
    const paymentIds = await getPaymentIdsByNameSearch(name);
    pipeline.push({
      $match: {
        _id: { $in: paymentIds },
      },
    });
  }

  if (paymentNumber) {
    pipeline.push({
      $match: {
        paymentNumber: { $eq: paymentNumber },
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

  if (paymentTypeId) {
    pipeline.push({
      $match: {
        paymentTypeId: { $eq: paymentTypeId },
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
  const countingPipeline = pipeline.concat({
    $count: 'total',
  });
  const payments = Payments.aggregate(resultsPipeline).toArray();
  const totalResults = Payments.aggregate(countingPipeline).toArray();

  return Promise.all([payments, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
