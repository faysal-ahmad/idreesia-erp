import moment from 'moment';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { VisitorMulakaats } from 'meteor/idreesia-common/server/collections/security';
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/list-options';

export async function getVisitorMulakaats(params) {
  const pipeline = [];

  const {
    visitorId,
    startDate,
    endDate,
    pageIndex = DEFAULT_PAGE_INDEX,
    pageSize = DEFAULT_PAGE_SIZE,
  } = params;

  if (visitorId) {
    pipeline.push({
      $match: {
        visitorId: { $eq: visitorId },
      },
    });
  }

  if (startDate) {
    pipeline.push({
      $match: {
        mulakaatDate: {
          $gte: moment(startDate)
            .startOf('day')
            .toDate(),
        },
      },
    });
  }
  if (endDate) {
    pipeline.push({
      $match: {
        mulakaatDate: {
          $lte: moment(endDate)
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
    { $sort: { mulakaatDate: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const visitorMulakaats = VisitorMulakaats.aggregate(
    resultsPipeline
  ).toArray();
  const totalResults = VisitorMulakaats.aggregate(countingPipeline).toArray();

  return Promise.all([visitorMulakaats, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
