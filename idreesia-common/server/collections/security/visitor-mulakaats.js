import moment from 'moment';
import { Formats } from 'meteor/idreesia-common/constants';
import { get } from 'meteor/idreesia-common/utilities/lodash';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { VisitorMulakaat as VisitorMulakaatSchema } from 'meteor/idreesia-common/server/schemas/security';
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/list-options';

class VisitorMulakaats extends AggregatableCollection {
  constructor(name = 'security-visitor-mulakaat', options = {}) {
    const visitorMulakaats = super(name, options);
    visitorMulakaats.attachSchema(VisitorMulakaatSchema);
    return visitorMulakaats;
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  getPagedData(params) {
    const pipeline = [];

    const {
      visitorId,
      mulakaatDate,
      startDate,
      endDate,
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

    if (mulakaatDate) {
      pipeline.push({
        $match: {
          mulakaatDate: {
            $eq: moment(mulakaatDate, Formats.DATE_FORMAT)
              .startOf('day')
              .toDate(),
          },
        },
      });
    }

    if (startDate) {
      pipeline.push({
        $match: {
          mulakaatDate: {
            $gte: moment(startDate)
              .startOf('day')
              .toDate(),
          },
        },
      });
    }
    if (endDate) {
      pipeline.push({
        $match: {
          mulakaatDate: {
            $lte: moment(endDate)
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
      { $sort: { mulakaatDate: -1 } },
      { $skip: nPageIndex * nPageSize },
      { $limit: nPageSize },
    ]);

    const visitorMulakaats = this.aggregate(resultsPipeline).toArray();
    const totalResults = this.aggregate(countingPipeline).toArray();

    return Promise.all([visitorMulakaats, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }

  // **************************************************************
  // Utility Functions
  // **************************************************************
  isMulakaatAllowed(visitorId, mulakaatDate) {
    const mMulakaatDate = moment(mulakaatDate);
    // Before creating, ensure that there isn't already another record created
    // for last 7 days for this visitor.
    const date = mMulakaatDate.clone().startOf('day');
    const dates = [date.toDate()];
    for (let i = 1; i < 7; i++) {
      date.subtract(1, 'day');
      dates.push(date.toDate());
    }

    const existingMulakaat = this.findOne({
      visitorId,
      mulakaatDate: { $in: dates },
      cancelledDate: { $exists: false },
    });

    if (existingMulakaat) return false;
    return true;
  }
}

export default new VisitorMulakaats();
