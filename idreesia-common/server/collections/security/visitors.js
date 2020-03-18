import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Visitor as VisitorSchema } from 'meteor/idreesia-common/server/schemas/security';
import {
  AuditLogs,
  Attachments,
} from 'meteor/idreesia-common/server/collections/common';
import {
  EntityTypes,
  OperationTypes,
} from 'meteor/idreesia-common/constants/audit';
import { get, forOwn, keys } from 'meteor/idreesia-common/utilities/lodash';

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
    const { cnicNumber, contactNumber1, contactNumber2, dataSource } = values;
    if (cnicNumber) this.checkCnicNotInUse(cnicNumber);
    if (contactNumber1) this.checkContactNotInUse(contactNumber1);
    if (contactNumber2) this.checkContactNotInUse(contactNumber2);
    if (!dataSource) {
      throw new Error('Data Source is required to create a visitor.');
    }

    const date = new Date();
    const valuesToInsert = Object.assign({}, values, {
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });

    const visitorId = this.insert(valuesToInsert);
    AuditLogs.createAuditLog({
      entityId: visitorId,
      entityType: EntityTypes.VISITOR,
      operationType: OperationTypes.CREATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: values,
    });

    return this.findOne(visitorId);
  }

  updateVisitor(values, user) {
    const { _id } = values;
    const existingVisitor = this.findOne(_id);
    const changedValues = this.getChangedValues(_id, values, existingVisitor);

    if (keys(changedValues).length === 0) {
      // Nothing actually changed
      return this.findOne(_id);
    }

    const {
      cnicNumber,
      contactNumber1,
      contactNumber2,
      imageId,
    } = changedValues;
    if (cnicNumber) this.checkCnicNotInUse(cnicNumber, _id);
    if (contactNumber1) this.checkContactNotInUse(contactNumber1, _id);
    if (contactNumber2) this.checkContactNotInUse(contactNumber2, _id);

    if (imageId) {
      if (existingVisitor.imageId) {
        Attachments.removeAttachment(existingVisitor.imageId);
      }
    }

    const date = new Date();
    const valuesToUpdate = Object.assign({}, changedValues, {
      updatedAt: date,
      updatedBy: user._id,
    });

    this.update(_id, { $set: valuesToUpdate });

    AuditLogs.createAuditLog(
      {
        entityId: _id,
        entityType: EntityTypes.VISITOR,
        operationType: OperationTypes.UPDATE,
        operationBy: user._id,
        operationTime: date,
        auditValues: changedValues,
      },
      existingVisitor
    );

    return this.findOne(_id);
  }

  // Iterate through the incoming changed values and check which of the
  // values have actually changed.
  getChangedValues(_id, newValues, existingVisitor) {
    const changedValues = {};
    forOwn(newValues, (newValue, key) => {
      if (this.isValueChanged(key, newValue, existingVisitor)) {
        changedValues[key] = newValue;
      }
    });

    return changedValues;
  }

  isValueChanged(key, newValue, existingVisitor) {
    if (!existingVisitor[key] && !newValue) return false;
    let isChanged;

    switch (key) {
      case 'ehadDate':
      case 'birthDate':
        isChanged = !moment(existingVisitor[key]).isSame(moment(newValue));
        break;

      default:
        isChanged = existingVisitor[key] !== newValue;
        break;
    }

    return isChanged;
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
      updatedBetween,
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

    if (updatedBetween) {
      const updatedBetweenDates = JSON.parse(updatedBetween);

      if (updatedBetweenDates[0]) {
        pipeline.push({
          $match: {
            updatedAt: {
              $gte: moment(updatedBetweenDates[0], Formats.DATE_FORMAT)
                .startOf('day')
                .toDate(),
            },
          },
        });
      }
      if (updatedBetweenDates[1]) {
        pipeline.push({
          $match: {
            updatedAt: {
              $lte: moment(updatedBetweenDates[1], Formats.DATE_FORMAT)
                .endOf('day')
                .toDate(),
            },
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
