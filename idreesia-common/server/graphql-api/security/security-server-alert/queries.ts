import { endOfDay, startOfDay } from 'date-fns';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { SecurityServerAlerts } from 'meteor/idreesia-common/server/collections/security';
import { Formats } from 'meteor/idreesia-common/constants';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/list-options';

type PipelineStage = Record<string, unknown>;

interface CountResult {
  total: number;
}

// 'NOT_REVIEWED' selects alerts with no review yet.
export const NOT_REVIEWED = 'NOT_REVIEWED';

export interface SecurityServerAlertFilter {
  profileId?: string | null;
  channelId?: string | null;
  review?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  includeTest?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

// The filter's $match stages, shared by the flat and the grouped lists.
function getMatchPipeline({
  profileId,
  channelId,
  review,
  startDate,
  endDate,
  includeTest,
}: SecurityServerAlertFilter): PipelineStage[] {
  const pipeline: PipelineStage[] = [];

  if (profileId) {
    pipeline.push({ $match: { profileId: { $eq: profileId } } });
  }
  if (channelId) {
    pipeline.push({ $match: { channelId: { $eq: channelId } } });
  }
  if (review === NOT_REVIEWED) {
    pipeline.push({ $match: { review: { $exists: false } } });
  } else if (review) {
    pipeline.push({ $match: { review: { $eq: review } } });
  }
  if (startDate) {
    pipeline.push({
      $match: {
        timestamp: {
          $gte: startOfDay(parseDate(startDate, Formats.DATE_FORMAT)),
        },
      },
    });
  }
  if (endDate) {
    pipeline.push({
      $match: {
        timestamp: {
          $lte: endOfDay(parseDate(endDate, Formats.DATE_FORMAT)),
        },
      },
    });
  }
  // A profile's own alert list asks for that profile explicitly, so it
  // shows test alerts regardless.
  if (includeTest !== 'true' && !profileId) {
    pipeline.push({ $match: { profileIsTest: { $eq: false } } });
  }

  return pipeline;
}

function getPaging({
  pageIndex = DEFAULT_PAGE_INDEX,
  pageSize = DEFAULT_PAGE_SIZE,
}: SecurityServerAlertFilter) {
  const nPageIndex = Number.parseInt(
    String(pageIndex || DEFAULT_PAGE_INDEX),
    10
  );
  const nPageSize = Number.parseInt(String(pageSize || DEFAULT_PAGE_SIZE), 10);
  if (Number.isNaN(nPageIndex) || Number.isNaN(nPageSize)) {
    throw new Error('Invalid value passed for pageIndex or pageSize');
  }
  return [
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ] as PipelineStage[];
}

export async function getSecurityServerAlerts(
  filter: SecurityServerAlertFilter = {}
) {
  const pipeline = getMatchPipeline(filter);
  const countingPipeline = pipeline.concat({ $count: 'total' });
  const resultsPipeline = pipeline.concat([
    { $sort: { timestamp: -1, _id: 1 } },
    ...getPaging(filter),
  ]);

  const [data, totalResults] = await Promise.all([
    SecurityServerAlerts.aggregate(resultsPipeline),
    SecurityServerAlerts.aggregate<CountResult>(countingPipeline),
  ]);

  return {
    data,
    totalResults: get(totalResults, ['0', 'total'], 0),
  };
}

/**
 * The filtered alerts rolled up per profile (one profile per watched person),
 * most recently seen first. Each group carries its latest alert's snapshot.
 */
export async function getSecurityServerAlertGroups(
  filter: SecurityServerAlertFilter = {}
) {
  const pipeline = getMatchPipeline(filter).concat([
    { $sort: { timestamp: -1, _id: 1 } },
    {
      $group: {
        _id: '$profileId',
        profileName: { $first: '$profileName' },
        profileIsTest: { $first: '$profileIsTest' },
        alertCount: { $sum: 1 },
        notReviewedCount: {
          $sum: { $cond: [{ $ifNull: ['$review', false] }, 0, 1] },
        },
        firstTimestamp: { $last: '$timestamp' },
        lastTimestamp: { $first: '$timestamp' },
        latestImageKey: { $first: '$imageKey' },
      },
    },
  ]);
  const countingPipeline = pipeline.concat({ $count: 'total' });
  const resultsPipeline = pipeline.concat([
    { $sort: { lastTimestamp: -1, _id: 1 } },
    ...getPaging(filter),
    { $addFields: { profileId: '$_id' } },
  ]);

  const [data, totalResults] = await Promise.all([
    SecurityServerAlerts.aggregate(resultsPipeline),
    SecurityServerAlerts.aggregate<CountResult>(countingPipeline),
  ]);

  return {
    data,
    totalResults: get(totalResults, ['0', 'total'], 0),
  };
}
