import moment from 'moment';
import { Formats } from 'meteor/idreesia-common/constants';
import { get, forOwn, keys } from 'meteor/idreesia-common/utilities/lodash';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { ImdadRequest as ImdadRequestSchema } from 'meteor/idreesia-common/server/schemas/accounts';
import { ImdadRequestStatus } from 'meteor/idreesia-common/constants/accounts';
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/list-options';

class ImdadRequests extends AggregatableCollection {
  constructor(name = 'accounts-imdad-requests', options = {}) {
    const imdadRequests = super(name, options);
    imdadRequests.attachSchema(ImdadRequestSchema);
    return imdadRequests;
  }

  // **************************************************************
  // Create/Update Methods
  // **************************************************************
  createImdadRequest(values, user) {
    const { requestDate, visitorId } = values;
    if (!values.dataSource) {
      throw new Error('Data Source is required to create an Imdad Request.');
    }

    if (!this.isImdadRequestAllowed(visitorId)) {
      throw new Error(
        'Visitor already has submitted an imdad request in the last 30 days.'
      );
    }

    const date = new Date();
    const valuesToInsert = Object.assign({}, values, {
      requestDate: moment(requestDate)
        .startOf('day')
        .toDate(),
      status: ImdadRequestStatus.CREATED,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });

    const imdadRequestId = this.insert(valuesToInsert);
    return this.findOne(imdadRequestId);
  }

  updateImdadRequest(values, user) {
    const { _id } = values;
    const existingImdadRequest = this.findOne(_id);
    const changedValues = this.getChangedValues(
      _id,
      values,
      existingImdadRequest
    );

    if (keys(changedValues).length === 0) {
      // Nothing actually changed
      return this.findOne(_id);
    }

    const date = new Date();
    const valuesToUpdate = Object.assign({}, changedValues, {
      updatedAt: date,
      updatedBy: user._id,
    });

    this.update(_id, { $set: valuesToUpdate });
    return this.findOne(_id);
  }

  // Iterate through the incoming changed values and check which of the
  // values have actually changed.
  getChangedValues(_id, newValues, existingImdadRequest) {
    const changedValues = {};
    forOwn(newValues, (newValue, key) => {
      if (this.isValueChanged(key, newValue, existingImdadRequest)) {
        changedValues[key] = newValue;
      }
    });

    return changedValues;
  }

  isValueChanged(key, newValue, existingImdadRequest) {
    if (!existingImdadRequest[key] && !newValue) return false;
    let isChanged;

    switch (key) {
      default:
        isChanged = existingImdadRequest[key] !== newValue;
        break;
    }

    return isChanged;
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
      { $sort: { requestDate: -1 } },
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

  // **************************************************************
  // Utility Functions
  // **************************************************************
  isImdadRequestAllowed(visitorId) {
    // Before creating, ensure that there isn't already another record created
    // for last 30 days for this visitor.
    const date = moment()
      .startOf('day')
      .subtract(30, 'days');
    const previousRequest = this.findOne({
      visitorId,
      requestDate: { $gte: date.toDate() },
    });

    if (previousRequest) return false;
    return true;
  }
}

export default new ImdadRequests();
