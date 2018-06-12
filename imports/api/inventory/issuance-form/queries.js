import moment from 'moment';
import { parse } from 'query-string';
import { get } from 'lodash';

import { IssuanceForms } from '/imports/lib/collections/inventory';
import { Formats } from '/imports/lib/constants';

export default function getIssuanceForms(queryString) {
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
    const mStartDate = moment(startDate, Formats.DATE_FORMAT);
    if (mStartDate.isValid()) {
      pipeline.push({
        $match: {
          issueDate: { $gte: mStartDate.toDate() },
        },
      });
    }
  }

  if (endDate && endDate !== '') {
    const mEndDate = moment(endDate, Formats.DATE_FORMAT);
    if (mEndDate.isValid()) {
      pipeline.push({
        $match: {
          issueDate: { $lte: mEndDate.toDate() },
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

  return {
    issuanceForms: IssuanceForms.aggregate(resultsPipeline),
    totalResults: get(IssuanceForms.aggregate(countingPipeline), ['0', 'total'], 0),
  };
}
