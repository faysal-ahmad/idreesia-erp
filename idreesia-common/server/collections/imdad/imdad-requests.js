import moment from 'moment';
import { Formats } from 'meteor/idreesia-common/constants';
import { get } from 'meteor/idreesia-common/utilities/lodash';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { ImdadRequest as ImdadRequestSchema } from 'meteor/idreesia-common/server/schemas/imdad';
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/list-options';

class ImdadRequests extends AggregatableCollection {
  constructor(name = 'imdad-imdad-requests', options = {}) {
    const imdadRequests = super(name, options);
    imdadRequests.attachSchema(ImdadRequestSchema);
    return imdadRequests;
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  getPagedData(params) {
    const pipeline = [];

    const {
      visitorId,
      requestDate,
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

    if (requestDate) {
      pipeline.push({
        $match: {
          requestDate: {
            $eq: moment(requestDate, Formats.DATE_FORMAT)
              .startOf('day')
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

    const imdadRequests = this.aggregate(resultsPipeline).toArray();
    const totalResults = this.aggregate(countingPipeline).toArray();

    return Promise.all([imdadRequests, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }
}

export default new ImdadRequests();
