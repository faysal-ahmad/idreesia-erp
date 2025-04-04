import { parse } from 'query-string';
import moment from 'moment';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { VisitorStays } from 'meteor/idreesia-common/server/collections/security';
import { Formats } from 'meteor/idreesia-common/constants';
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/list-options';
import {
  DEFAULT_SORT_ORDER,
  DEFAULT_SORT_BY,
  SORT_BY,
} from 'meteor/idreesia-common/constants/security/list-options';

const sortByColumnMapping = {
  [SORT_BY.NAME]: 'visitor.name',
  [SORT_BY.CITY]: 'visitor.city',
  [SORT_BY.STAY_DATE]: 'fromDate',
};

const sortOrderMapping = {
  asc: 1,
  desc: -1,
};

async function getVisitorIdsByNameSearch(name) {
  const pipeline = [
    { $match: { $text: { $search: name } } },
    { $sort: { score: { $meta: 'textScore' } } },
    { $limit: 50 },
  ];

  const visitors = await People.aggregate(pipeline);
  return visitors.map(({ _id }) => _id);
}

export async function getVisitorStays(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const {
    visitorId,
    startDate,
    endDate,
    name,
    city,
    stayReason,
    additionalInfo,
    sortBy = DEFAULT_SORT_BY,
    sortOrder = DEFAULT_SORT_ORDER,
    pageIndex = DEFAULT_PAGE_INDEX,
    pageSize = DEFAULT_PAGE_SIZE,
  } = params;

  if (!sortOrderMapping[sortOrder])
    throw new Error('Invalid value passed for sortOrder');
  if (!sortByColumnMapping[sortBy])
    throw new Error('Invalid column name passed for sortBy');

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
        fromDate: {
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
        toDate: {
          $lte: moment(endDate, Formats.DATE_FORMAT)
            .endOf('day')
            .toDate(),
        },
      },
    });
  }

  pipeline.push({
    $lookup: {
      from: People._name,
      localField: 'visitorId',
      foreignField: '_id',
      as: 'visitor',
    },
  });

  if (name) {
    const visitorIds = await getVisitorIdsByNameSearch(name);
    pipeline.push({
      $match: {
        'visitor._id': { $in: visitorIds },
      },
    });
  }

  if (city) {
    pipeline.push({
      $match: {
        'visitor.visitorData.city': { $eq: city },
      },
    });
  }

  if (stayReason) {
    pipeline.push({
      $match: {
        stayReason: { $eq: stayReason },
      },
    });
  }

  if (additionalInfo) {
    if (additionalInfo === 'has-notes') {
      pipeline.push({
        $match: {
          'visitor.visitorData.otherNotes': { $exists: true, $nin: ['', null] },
        },
      });
    } else if (additionalInfo === 'has-criminal-record') {
      pipeline.push({
        $match: {
          'visitor.visitorData.criminalRecord': {
            $exists: true,
            $nin: ['', null],
          },
        },
      });
    } else if (additionalInfo === 'has-notes-or-criminal-record') {
      pipeline.push({
        $match: {
          $or: [
            {
              'visitor.visitorData.otherNotes': {
                $exists: true,
                $nin: ['', null],
              },
            },
            {
              'visitor.visitorData.criminalRecord': {
                $exists: true,
                $nin: ['', null],
              },
            },
          ],
        },
      });
    }
  }

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);

  const sortByColumnName = sortByColumnMapping[sortBy];
  const resultsPipeline = pipeline.concat([
    { $sort: { [sortByColumnName]: sortOrderMapping[sortOrder] } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const visitors = VisitorStays.aggregate(resultsPipeline);
  const totalResults = VisitorStays.aggregate(countingPipeline);

  return Promise.all([visitors, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
