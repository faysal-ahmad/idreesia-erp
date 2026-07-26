import { Attendances } from 'meteor/idreesia-common/server/collections/hr';
import { parse } from 'query-string';
import { get } from 'meteor/idreesia-common/utilities/lodash';

type PipelineStage = Record<string, unknown>;

interface CountResult {
  total: number;
}

export function getPagedAttendanceByKarkun(queryString: string) {
  const params = parse(queryString);
  const pipeline: PipelineStage[] = [];
  const { pageIndex = '0', pageSize = '20', karkunId } = params;

  pipeline.push({
    $match: {
      karkunId: {
        $eq: karkunId,
      },
    },
  });

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(String(pageIndex), 10);
  const nPageSize = parseInt(String(pageSize), 10);
  const resultsPipeline = pipeline.concat([
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: nPageIndex * nPageSize,
    },
    {
      $limit: nPageSize,
    },
  ]);

  const karkunAttendences = Attendances.aggregate(resultsPipeline);
  const totalResults = Attendances.aggregate<CountResult>(countingPipeline);

  return Promise.all([karkunAttendences, totalResults]).then(results => ({
    attendance: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
