import { endOfDay, startOfDay } from 'date-fns';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Message as MessageSchema } from 'meteor/idreesia-common/server/schemas/communication';

interface MessageDocument {
  _id?: string;
  source?: string;
  sentDate?: Date;
  createdAt?: Date;
  [key: string]: unknown;
}

interface SearchMessagesFilter {
  source?: string;
  startDate?: string;
  endDate?: string;
  pageIndex?: string;
  pageSize?: string;
}

interface CountResult {
  total: number;
}

class Messages extends AggregatableCollection<MessageDocument> {
  constructor(name = 'communication-messages', options = {}) {
    super(name, options);
    this.attachSchema(MessageSchema);
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  searchMessages(filter: SearchMessagesFilter) {
    const {
      source,
      startDate,
      endDate,
      pageIndex = '0',
      pageSize = '20',
    } = filter;
    const pipeline: Record<string, unknown>[] = [];

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
            $gte: startOfDay(parseDate(startDate, Formats.DATE_FORMAT)),
          },
        },
      });
    }
    if (endDate) {
      pipeline.push({
        $match: {
          sentDate: {
            $lte: endOfDay(parseDate(endDate, Formats.DATE_FORMAT)),
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

    const messages = this.aggregate<MessageDocument>(resultsPipeline);
    const totalResults = this.aggregate<CountResult>(countingPipeline);

    return Promise.all([messages, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }
}

export default new Messages();
