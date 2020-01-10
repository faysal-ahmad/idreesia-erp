import moment from 'moment';
import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Payments } from 'meteor/idreesia-common/server/collections/accounts';
import { Formats } from 'meteor/idreesia-common/constants';

export function getInfoForNewPayment(paymentType, paymentDate) {
  const currentDate = moment(paymentDate);

  let year = moment().year();
  if (currentDate.month() <= 5) {
    year -= 1;
  }

  const startDate = moment(`${year}-07-01 00:00:00`, 'YYYY-MM-DD hh:mm:ss');
  const endDate = moment(`${year + 1}-06-30 23:59:59`, 'YYYY-MM-DD hh:mm:ss');
  // Find the payment for this company, having the passed payment type, between the
  // start and end date, that has the largest payment number.
  const payment1 = Payments.findOne(
    {
      paymentType,
      paymentDate: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    },
    {
      sort: {
        paymentNumber: -1,
      },
    }
  );

  // Find the payment for this company, between the start and end date, that has
  // the largest order.
  const payment2 = Payments.findOne(
    {
      paymentDate: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    },
    {
      sort: {
        order: -1,
      },
    }
  );

  return {
    paymentNumber: payment1 ? payment1.paymentNumber + 1 : 1,
    order: payment2 ? payment2.order + 1 : 1,
  };
}

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

    // if (name.length === 1) {
    //   pipeline.push({
    //     $match: { name: { $regex: `^${name}` } },
    //   });
    // } else {
    //   pipeline.push({
    //     $match: { $text: { $search: name } },
    //   });
    // }
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
