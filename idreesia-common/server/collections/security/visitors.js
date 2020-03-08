import moment from 'moment';
import { Formats } from 'meteor/idreesia-common/constants';
import { get } from 'meteor/idreesia-common/utilities/lodash';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Visitor as VisitorSchema } from 'meteor/idreesia-common/server/schemas/security';
import { createAttachment } from 'meteor/idreesia-common/server/graphql-api/common/attachment/utilities';

class Visitors extends AggregatableCollection {
  constructor(name = 'security-visitors', options = {}) {
    const visitors = super(name, options);
    visitors.attachSchema(VisitorSchema);
    return visitors;
  }

  // **************************************************************
  // Create/Update Methods
  // **************************************************************
  createVisitor(values, user) {
    const {
      cnicNumber,
      contactNumber1,
      contactNumber2,
      dataSource,
      imageData,
    } = values;
    if (cnicNumber) this.checkCnicNotInUse(cnicNumber);
    if (contactNumber1) this.checkContactNotInUse(contactNumber1);
    if (contactNumber2) this.checkContactNotInUse(contactNumber2);
    if (!dataSource) {
      throw new Error('Data Source is required to create a visitor.');
    }

    let imageId = null;
    if (imageData) {
      imageId = createAttachment(
        {
          data: imageData,
        },
        { user }
      );
    }

    const date = new Date();
    const valuesToInsert = Object.assign({}, values, {
      imageId,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });

    delete valuesToInsert.imageData;
    const visitorId = this.insert(valuesToInsert);
    return this.findOne(visitorId);
  }

  updateVisitor(values, user) {
    const { _id, cnicNumber, contactNumber1, contactNumber2 } = values;
    if (cnicNumber) this.checkCnicNotInUse(cnicNumber, _id);
    if (contactNumber1) this.checkContactNotInUse(contactNumber1, _id);
    if (contactNumber2) this.checkContactNotInUse(contactNumber2, _id);

    const date = new Date();
    const valuesToInsert = Object.assign({}, values, {
      updatedAt: date,
      updatedBy: user._id,
    });

    delete valuesToInsert._id;
    this.update(_id, { $set: valuesToInsert });
    return this.findOne(_id);
  }

  // **************************************************************
  // Custom Finder Methods
  // **************************************************************
  findByCnicOrContactNumber(cnicNumber, contactNumber) {
    let visitor = null;

    if (cnicNumber) {
      visitor = this.findOne({
        cnicNumber: { $eq: cnicNumber },
      });
    }

    if (visitor) return visitor;

    if (contactNumber) {
      visitor = this.findOne({
        $or: [
          { contactNumber1: contactNumber },
          { contactNumber2: contactNumber },
        ],
      });
    }

    return visitor;
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  searchVisitors(params = {}) {
    const pipeline = [];

    const {
      name,
      cnicNumber,
      phoneNumber,
      city,
      ehadDuration,
      ehadDate,
      additionalInfo,
      dataSource,
      pageIndex = '0',
      pageSize = '20',
    } = params;

    if (dataSource) {
      pipeline.push({
        $match: {
          dataSource: { $regex: new RegExp(`^${dataSource}`, 'i') },
        },
      });
    }

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

    if (city) {
      pipeline.push({
        $match: {
          city: { $eq: city },
        },
      });
    }

    if (ehadDate) {
      pipeline.push({
        $match: {
          ehadDate: {
            $eq: moment(ehadDate, Formats.DATE_FORMAT)
              .startOf('day')
              .toDate(),
          },
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
