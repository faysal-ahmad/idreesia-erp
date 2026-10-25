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

export async function getSecurityServerAlerts(
  filter: SecurityServerAlertFilter = {}
) {
  const {
    profileId,
    channelId,
    review,
    startDate,
    endDate,
    includeTest,
    pageIndex = DEFAULT_PAGE_INDEX,
    pageSize = DEFAULT_PAGE_SIZE,
  } = filter;
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

  const nPageIndex = Number.parseInt(String(pageIndex || DEFAULT_PAGE_INDEX), 10);
  const nPageSize = Number.parseInt(String(pageSize || DEFAULT_PAGE_SIZE), 10);
  if (Number.isNaN(nPageIndex) || Number.isNaN(nPageSize)) {
    throw new Error('Invalid value passed for pageIndex or pageSize');
  }

  const countingPipeline = pipeline.concat({ $count: 'total' });
  const resultsPipeline = pipeline.concat([
    { $sort: { timestamp: -1, _id: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
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
