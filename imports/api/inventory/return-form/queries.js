import moment from 'moment';
import { parse } from 'query-string';
import { get } from 'lodash';

import { ReturnForms } from '/imports/lib/collections/inventory';
import { Formats } from '/imports/lib/constants';

export default function getReturnForms(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const {
    physicalStoreId,
    showApproved,
    showUnapproved,
    startDate,
    endDate,
    pageIndex = '0',
    pageSize = '10',
  } = params;

  if (physicalStoreId && physicalStoreId !== '') {
    pipeline.push({
      $match: {
        physicalStoreId: { $eq: physicalStoreId },
      },
    });
  }

  if (showApproved === 'false' && showUnapproved === 'false') {
    return {
      issuanceForms: [],
      totalResults: 0,
    };
  } else if (showApproved === 'true' && showUnapproved === 'false') {
    pipeline.push({
      $match: {
        approvedOn: { $ne: null },
      },
    });
  } else if (showApproved === 'false' && showUnapproved === 'true') {
    pipeline.push({
      $match: {
        approvedOn: { $eq: null },
      },
    });
  }

  if (startDate && startDate !== '') {
    const mStartDate = moment
      .utc(startDate, Formats.DATE_FORMAT)
      .subtract(1, 'd')
      .endOf('day');
    if (mStartDate.isValid()) {
      pipeline.push({
        $match: {
          returnDate: { $gt: mStartDate.toDate() },
        },
      });
    }
  }

  if (endDate && endDate !== '') {
    const mEndDate = moment
      .utc(endDate, Formats.DATE_FORMAT)
      .add(1, 'd')
      .startOf('day');
    if (mEndDate.isValid()) {
      pipeline.push({
        $match: {
          returnDate: { $lt: mEndDate.toDate() },
        },
      });
    }
  }

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  console.log(JSON.stringify(resultsPipeline));
  return {
    returnForms: ReturnForms.aggregate(resultsPipeline),
    totalResults: get(ReturnForms.aggregate(countingPipeline), ['0', 'total'], 0),
  };
}
