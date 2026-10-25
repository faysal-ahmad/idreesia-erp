import { escapeRegExp, get } from 'meteor/idreesia-common/utilities/lodash';
import { SecurityServerProfiles } from 'meteor/idreesia-common/server/collections/security';
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/list-options';

type PipelineStage = Record<string, unknown>;

interface CountResult {
  total: number;
}

export interface SecurityServerProfileFilter {
  name?: string | null;
  includeTest?: string | null;
  includeDeleted?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

export async function getSecurityServerProfiles(
  filter: SecurityServerProfileFilter = {}
) {
  const {
    name,
    includeTest,
    includeDeleted,
    pageIndex = DEFAULT_PAGE_INDEX,
    pageSize = DEFAULT_PAGE_SIZE,
  } = filter;
  const pipeline: PipelineStage[] = [];

  if (includeDeleted !== 'true') {
    pipeline.push({ $match: { deletedAt: { $exists: false } } });
  }
  if (includeTest !== 'true') {
    pipeline.push({ $match: { isTest: { $eq: false } } });
  }
  if (name) {
    pipeline.push({
      $match: { name: { $regex: escapeRegExp(name), $options: 'i' } },
    });
  }

  const nPageIndex = Number.parseInt(
    String(pageIndex || DEFAULT_PAGE_INDEX),
    10
  );
  const nPageSize = Number.parseInt(String(pageSize || DEFAULT_PAGE_SIZE), 10);
  if (Number.isNaN(nPageIndex) || Number.isNaN(nPageSize)) {
    throw new Error('Invalid value passed for pageIndex or pageSize');
  }

  const countingPipeline = pipeline.concat({ $count: 'total' });
  const resultsPipeline = pipeline.concat([
    { $sort: { name: 1, _id: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const [data, totalResults] = await Promise.all([
    SecurityServerProfiles.aggregate(resultsPipeline),
    SecurityServerProfiles.aggregate<CountResult>(countingPipeline),
  ]);

  return {
    data,
    totalResults: get(totalResults, ['0', 'total'], 0),
  };
}
