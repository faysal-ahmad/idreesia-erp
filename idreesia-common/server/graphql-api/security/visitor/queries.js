import { parse } from 'query-string';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';

export function getVisitors(queryString) {
  const params = parse(queryString);
  const pipeline = [];

  const {
    name,
    cnicNumber,
    phoneNumber,
    additionalInfo,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  if (name) {
    pipeline.push({
      $match: { $text: { $search: name } },
    });
  }

  if (cnicNumber) {
    pipeline.push({
      $match: {
        cnicNumber: { $eq: cnicNumber },
      },
    });
  }

  if (phoneNumber) {
    pipeline.push({
      $match: {
        $or: [{ contactNumber1: phoneNumber }, { contactNumber2: phoneNumber }],
      },
    });
  }

  if (additionalInfo) {
    if (additionalInfo === 'has-notes') {
      pipeline.push({
        $match: {
          otherNotes: { $exists: true, $nin: ['', null] },
        },
      });
    } else if (additionalInfo === 'has-criminal-record') {
      pipeline.push({
        $match: {
          criminalRecord: { $exists: true, $nin: ['', null] },
        },
      });
    } else if (additionalInfo === 'has-notes-or-criminal-record') {
      pipeline.push({
        $match: {
          $or: [
            { otherNotes: { $exists: true, $nin: ['', null] } },
            { criminalRecord: { $exists: true, $nin: ['', null] } },
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
  const resultsPipeline = pipeline.concat([
    { $sort: { name: 1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const visitors = Visitors.aggregate(resultsPipeline).toArray();
  const totalResults = Visitors.aggregate(countingPipeline).toArray();

  return Promise.all([visitors, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
