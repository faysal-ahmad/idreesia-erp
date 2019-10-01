import moment from 'moment';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { VoucherDetails } from 'meteor/idreesia-common/server/collections/accounts';
import { Formats } from 'meteor/idreesia-common/constants';

export default function getVoucherDetails(
  companyId,
  accountHeadIds,
  startDate,
  endDate,
  includeCredits,
  includeDebits,
  pageIndex,
  pageSize
) {
  const mStartDate = moment(startDate, Formats.DATE_FORMAT).startOf('day');
  const mEndDate = moment(endDate, Formats.DATE_FORMAT).endOf('day');

  const pipeline = [
    {
      $match: {
        companyId: { $eq: companyId },
        accountHeadId: { $in: accountHeadIds },
      },
    },
    {
      $lookup: {
        from: 'accounts-vouchers',
        localField: 'voucherId',
        foreignField: '_id',
        as: 'voucher',
      },
    },
    {
      $unwind: '$voucher',
    },
    {
      $match: {
        'voucher.voucherDate': {
          $gte: mStartDate.toDate(),
        },
      },
    },
    {
      $match: {
        'voucher.voucherDate': {
          $lte: mEndDate.toDate(),
        },
      },
    },
  ];

  if (includeCredits && !includeDebits) {
    pipeline.push({
      $match: {
        isCredit: { $eq: true },
      },
    });
  }

  if (!includeCredits && includeDebits) {
    pipeline.push({
      $match: {
        isCredit: { $eq: false },
      },
    });
  }

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const resultsPipeline = pipeline.concat([
    { $sort: { voucherDate: -1, order: -1 } },
    { $skip: pageIndex * pageSize },
    { $limit: pageSize },
  ]);

  const voucherDetails = VoucherDetails.aggregate(resultsPipeline).toArray();
  const totalResults = VoucherDetails.aggregate(countingPipeline).toArray();

  return Promise.all([voucherDetails, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
