import moment from 'moment';

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
    // for the week of this date for this visitor.
    const weekDate = mMulakaatDate.clone().startOf('isoWeek');
    const weekDates = [weekDate.toDate()];
    for (let i = 1; i < 7; i++) {
      weekDate.add(1, 'day');
      weekDates.push(weekDate.toDate());
    }

    const existingMulakaat = VisitorMulakaats.findOne({
      visitorId,
      mulakaatDate: { $in: weekDates },
      cancelledDate: { $exists: false },
    });

    if (existingMulakaat) return false;
    return true;
  }
}

export default new VisitorMulakaats();
