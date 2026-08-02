import { parse } from 'query-string';
import { endOfDay, startOfDay } from 'date-fns';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { VisitorStays } from 'meteor/idreesia-common/server/collections/security';
import { Formats } from 'meteor/idreesia-common/constants';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';
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

type PipelineStage = Record<string, unknown>;

interface CountResult {
  total: number;
}

async function getVisitorIdsByNameSearch(name: string) {
  const pipeline: PipelineStage[] = [
    { $match: { $text: { $search: name } } },
    { $sort: { score: { $meta: 'textScore' } } },
    { $limit: 50 },
  ];

  const visitors = await People.aggregate(pipeline);
  return visitors.map(({ _id }: { _id: string }) => _id);
}

export async function getVisitorStays(queryString: string) {
  const params = parse(queryString);
  const pipeline: PipelineStage[] = [];

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
  const visitorIdText = typeof visitorId === 'string' ? visitorId : '';
  const startDateText = typeof startDate === 'string' ? startDate : '';
  const endDateText = typeof endDate === 'string' ? endDate : '';
  const nameText = typeof name === 'string' ? name : '';
  const cityText = typeof city === 'string' ? city : '';
  const stayReasonText = typeof stayReason === 'string' ? stayReason : '';
  const additionalInfoText =
    typeof additionalInfo === 'string' ? additionalInfo : '';
  const sortByText = typeof sortBy === 'string' ? sortBy : DEFAULT_SORT_BY;
  const sortOrderText =
    typeof sortOrder === 'string' ? sortOrder : DEFAULT_SORT_ORDER;

  if (!sortOrderMapping[sortOrderText as keyof typeof sortOrderMapping])
    throw new Error('Invalid value passed for sortOrder');
  if (!sortByColumnMapping[sortByText as keyof typeof sortByColumnMapping])
    throw new Error('Invalid column name passed for sortBy');

  if (visitorIdText) {
    pipeline.push({
      $match: {
        visitorId: { $eq: visitorIdText },
      },
    });
  }

  if (startDateText) {
    pipeline.push({
      $match: {
        fromDate: {
          $gte: startOfDay(parseDate(startDateText, Formats.DATE_FORMAT)),
        },
      },
    });
  }
  if (endDateText) {
    pipeline.push({
      $match: {
        toDate: {
          $lte: endOfDay(parseDate(endDateText, Formats.DATE_FORMAT)),
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

  if (nameText) {
    const visitorIds = await getVisitorIdsByNameSearch(nameText);
    pipeline.push({
      $match: {
        'visitor._id': { $in: visitorIds },
      },
    });
  }

  if (cityText) {
    pipeline.push({
      $match: {
        'visitor.visitorData.city': { $eq: cityText },
      },
    });
  }

  if (stayReasonText) {
    pipeline.push({
      $match: {
        stayReason: { $eq: stayReasonText },
      },
    });
  }

  if (additionalInfoText) {
    if (additionalInfoText === 'has-notes') {
      pipeline.push({
        $match: {
          'visitor.visitorData.otherNotes': { $exists: true, $nin: ['', null] },
        },
      });
    } else if (additionalInfoText === 'has-criminal-record') {
      pipeline.push({
        $match: {
          'visitor.visitorData.criminalRecord': {
            $exists: true,
            $nin: ['', null],
          },
        },
      });
    } else if (additionalInfoText === 'has-notes-or-criminal-record') {
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

  const nPageIndex = Number.parseInt(String(pageIndex || DEFAULT_PAGE_INDEX), 10);
  const nPageSize = Number.parseInt(String(pageSize || DEFAULT_PAGE_SIZE), 10);
  if (Number.isNaN(nPageIndex) || Number.isNaN(nPageSize)) {
    throw new Error('Invalid value passed for pageIndex or pageSize');
  }

  const sortByColumnName =
    sortByColumnMapping[sortByText as keyof typeof sortByColumnMapping];
  const sortDirection =
    sortOrderMapping[sortOrderText as keyof typeof sortOrderMapping];
  const resultsPipeline = pipeline.concat([
    { $sort: { [sortByColumnName]: sortDirection } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const visitors = VisitorStays.aggregate(resultsPipeline);
  const totalResults = VisitorStays.aggregate<CountResult>(countingPipeline);

  return Promise.all([visitors, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
