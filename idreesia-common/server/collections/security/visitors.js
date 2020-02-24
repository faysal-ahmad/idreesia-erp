import { parse } from 'query-string';
import moment from 'moment';
import { get } from 'meteor/idreesia-common/utilities/lodash';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Visitor as VisitorSchema } from 'meteor/idreesia-common/server/schemas/security';

class Visitors extends AggregatableCollection {
  constructor(name = 'security-visitors', options = {}) {
    const visitors = super(name, options);
    visitors.attachSchema(VisitorSchema);
    return visitors;
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  searchVisitors(queryString) {
    const params = parse(queryString);
    const pipeline = [];

    const {
      name,
      cnicNumber,
      phoneNumber,
      ehadDuration,
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
          $or: [
            { contactNumber1: phoneNumber },
            { contactNumber2: phoneNumber },
          ],
        },
      });
    }

    if (ehadDuration) {
      const { scale, duration } = JSON.parse(ehadDuration);
      if (duration) {
        const date = moment()
          .startOf('day')
          .subtract(duration, scale);

        pipeline.push({
          $match: {
            ehadDate: {
              $gte: moment(date).toDate(),
            },
          },
        });
      }
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

    const visitors = this.aggregate(resultsPipeline).toArray();
    const totalResults = this.aggregate(countingPipeline).toArray();

    return Promise.all([visitors, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }

  // **************************************************************
  // Utility Functions
  // **************************************************************
  isCnicInUse(cnicNumber) {
    const visitor = this.findOne({
      cnicNumber: { $eq: cnicNumber },
    });

    if (visitor) return true;
    return false;
  }

  checkCnicNotInUse(cnicNumber, visitorId) {
    const visitor = this.findOne({
      cnicNumber: { $eq: cnicNumber },
    });

    if (visitor && (!visitorId || visitor._id !== visitorId)) {
      throw new Error(`This CNIC number is already set for ${visitor.name}.`);
    }
  }

  isContactNumberInUse(contactNumber) {
    const visitor = this.findOne({
      $or: [
        { contactNumber1: { $eq: contactNumber } },
        { contactNumber2: { $eq: contactNumber } },
      ],
    });

    if (visitor) return true;
    return false;
  }

  checkContactNotInUse(contactNumber, visitorId) {
    const visitor = this.findOne({
      $or: [
        { contactNumber1: { $eq: contactNumber } },
        { contactNumber2: { $eq: contactNumber } },
      ],
    });

    if (visitor && (!visitorId || visitor._id !== visitorId)) {
      throw new Error(
        `This contact number is already set for ${visitor.name}.`
      );
    }
  }
}

export default new Visitors();
