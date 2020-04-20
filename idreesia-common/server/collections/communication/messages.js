import moment from 'moment';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Message as MessageSchema } from 'meteor/idreesia-common/server/schemas/communication';

class Messages extends AggregatableCollection {
  constructor(name = 'communication-messages', options = {}) {
    const messages = super(name, options);
    messages.attachSchema(MessageSchema);
    return messages;
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  searchMessages(filter) {
    const {
      source,
      startDate,
      endDate,
      pageIndex = '0',
      pageSize = '20',
    } = filter;
    const pipeline = [];

    if (source) {
      pipeline.push({
        $match: {
          source: { $eq: source },
        },
      });
    }

    if (startDate) {
      pipeline.push({
        $match: {
          sentDate: {
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
          sentDate: {
            $lte: moment(endDate, Formats.DATE_FORMAT)
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
      { $sort: { createdAt: -1 } },
      { $skip: nPageIndex * nPageSize },
      { $limit: nPageSize },
    ]);

    const messages = this.aggregate(resultsPipeline).toArray();
    const totalResults = this.aggregate(countingPipeline).toArray();

    return Promise.all([messages, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }
}

export default new Messages();
