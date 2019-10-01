import moment from 'moment';
import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Vouchers } from 'meteor/idreesia-common/server/collections/accounts';
import { Formats } from 'meteor/idreesia-common/constants';

export function getInfoForNewVoucher(companyId, voucherType, voucherDate) {
  const currentDate = moment(voucherDate);

  let year = moment().year();
  if (currentDate.month() <= 5) {
    year -= 1;
  }

  const startDate = moment(`${year}-07-01 00:00:00`, 'YYYY-MM-DD hh:mm:ss');
  const endDate = moment(`${year + 1}-06-30 23:59:59`, 'YYYY-MM-DD hh:mm:ss');
  // Find the voucher for this company, having the passed voucher type, between the
  // start and end date, that has the largest voucher number.
  const voucher1 = Vouchers.findOne(
    {
      companyId,
      voucherType,
      voucherDate: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    },
    {
      sort: {
        voucherNumber: -1,
      },
    }
  );

  // Find the voucher for this company, between the start and end date, that has
  // the largest order.
  const voucher2 = Vouchers.findOne(
    {
      companyId,
      voucherDate: {
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
    voucherNumber: voucher1 ? voucher1.voucherNumber + 1 : 1,
    order: voucher2 ? voucher2.order + 1 : 1,
  };
}

export function getVouchers(companyId, queryString) {
  const params = parse(queryString);
  const pipeline = [
    {
      $match: {
        companyId: { $eq: companyId },
      },
    },
  ];

  const {
    startDate,
    endDate,
    voucherNumber,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  if (voucherNumber) {
    pipeline.push({
      $match: {
        voucherNumber: { $eq: voucherNumber },
      },
    });
  }

  if (startDate) {
    pipeline.push({
      $match: {
        voucherDate: {
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
        voucherDate: {
          $lte: moment(endDate, Formats.DATE_FORMAT)
            .endOf('day')
            .toDate(),
        },
      },
    });
  }

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { voucherDate: -1, order: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const vouchers = Vouchers.aggregate(resultsPipeline).toArray();
  const totalResults = Vouchers.aggregate(countingPipeline).toArray();

  return Promise.all([vouchers, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
