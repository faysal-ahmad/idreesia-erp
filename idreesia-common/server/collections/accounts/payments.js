import moment from 'moment';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Payment as PaymentSchema } from 'meteor/idreesia-common/server/schemas/accounts';
import { Formats } from 'meteor/idreesia-common/constants';
import { get, forOwn, keys } from 'meteor/idreesia-common/utilities/lodash';
import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';
import {
  EntityTypes,
  OperationTypes,
} from 'meteor/idreesia-common/constants/audit';

class Payments extends AggregatableCollection {
  constructor(name = 'accounts-payments', options = {}) {
    const payments = super(name, options);
    payments.attachSchema(PaymentSchema);
    return payments;
  }

  // **************************************************************
  // Create/Update Methods
  // **************************************************************
  createPayment(values, user) {
    const { paymentNumber, paymentDate } = values;
    if (!this.isPaymentNoAvailable(paymentNumber, paymentDate)) {
      throw new Error('This Voucher Number is already used.');
    }

    const date = new Date();
    const valuesToInsert = Object.assign({}, values, {
      isDeleted: false,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });

    const paymentId = this.insert(valuesToInsert);
    AuditLogs.createAuditLog({
      entityId: paymentId,
      entityType: EntityTypes.PAYMENT,
      operationType: OperationTypes.CREATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: values,
    });

    return this.findOne(paymentId);
  }

  updatePayment(values, user) {
    const { _id } = values;
    const existingPayment = this.findOne(_id);
    const changedValues = this.getChangedValues(_id, values, existingPayment);

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

    AuditLogs.createAuditLog(
      {
        entityId: _id,
        entityType: EntityTypes.PAYMENT,
        operationType: OperationTypes.UPDATE,
        operationBy: user._id,
        operationTime: date,
        auditValues: changedValues,
      },
      existingPayment
    );

    return this.findOne(_id);
  }

  removePayment(_id, user) {
    const date = new Date();
    this.update(
      {
        _id,
      },
      {
        $set: {
          isDeleted: true,
          deletedAt: date,
          deletedBy: user._id,
        },
      }
    );

    AuditLogs.createAuditLog({
      entityId: _id,
      entityType: EntityTypes.PAYMENT,
      operationType: OperationTypes.DELETE,
      operationBy: user._id,
      operationTime: date,
    });

    return true;
  }

  // Iterate through the incoming changed values and check which of the
  // values have actually changed.
  getChangedValues(_id, newValues, existingPayment) {
    const changedValues = {};
    forOwn(newValues, (newValue, key) => {
      if (this.isValueChanged(key, newValue, existingPayment)) {
        changedValues[key] = newValue;
      }
    });

    return changedValues;
  }

  isValueChanged(key, newValue, existingPayment) {
    if (!existingPayment[key] && !newValue) return false;
    let isChanged;

    switch (key) {
      case 'paymentDate':
        isChanged = !moment(existingPayment[key]).isSame(moment(newValue));
        break;

      default:
        isChanged = existingPayment[key] !== newValue;
        break;
    }

    return isChanged;
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  async getPaymentIdsByNameSearch(name) {
    const pipeline = [
      { $match: { $text: { $search: name } } },
      {
        $match: {
          isDeleted: { $eq: false },
        },
      },
      { $sort: { score: { $meta: 'textScore' } } },
      { $limit: 50 },
    ];

    const payments = await this.aggregate(pipeline).toArray();
    return payments.map(({ _id }) => _id);
  }

  async getPayments(params) {
    const pipeline = [
      {
        $match: {
          isDeleted: { $eq: false },
        },
      },
    ];

    const {
      pageIndex = '0',
      pageSize = '20',
      paymentNumber,
      name,
      cnicNumber,
      paymentTypeId,
      startDate,
      endDate,
    } = params;

    if (name) {
      const paymentIds = await this.getPaymentIdsByNameSearch(name);
      pipeline.push({
        $match: {
          _id: { $in: paymentIds },
        },
      });
    }

    if (paymentNumber) {
      pipeline.push({
        $match: {
          paymentNumber: { $eq: paymentNumber },
        },
      });
    }

    if (cnicNumber) {
      pipeline.push({
        $match: {
          cnicNumber: { $eq: cnicNumber },
        },
      });
    }

    if (paymentTypeId) {
      pipeline.push({
        $match: {
          paymentTypeId: { $eq: paymentTypeId },
        },
      });
    }

    if (startDate) {
      pipeline.push({
        $match: {
          paymentDate: {
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
          paymentDate: {
            $lte: moment(endDate, Formats.DATE_FORMAT)
              .endOf('day')
              .toDate(),
          },
        },
      });
    }

    const nPageIndex = parseInt(pageIndex, 10);
    const nPageSize = parseInt(pageSize, 10);
    const resultsPipeline = pipeline.concat([
      { $sort: { paymentDate: -1 } },
      { $skip: nPageIndex * nPageSize },
      { $limit: nPageSize },
    ]);
    const countingPipeline = pipeline.concat({
      $count: 'total',
    });
    const payments = this.aggregate(resultsPipeline).toArray();
    const totalResults = this.aggregate(countingPipeline).toArray();

    return Promise.all([payments, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }

  // **************************************************************
  // Utility Functions
  // **************************************************************
  getNextPaymentNo() {
    const currentDate = moment();
    let year = moment().year();
    if (currentDate.month() <= 5) {
      year -= 1;
    }
    const startDate = moment(`${year}-07-01 00:00:00`, 'YYYY-MM-DD hh:mm:ss');
    const endDate = moment(`${year + 1}-06-30 23:59:59`, 'YYYY-MM-DD hh:mm:ss');
    const payment = this.findOne(
      {
        paymentDate: {
          $gte: startDate.toDate(),
          $lte: endDate.toDate(),
        },
      },
      {
        sort: {
          paymentNumber: -1,
        },
      }
    );

    return payment ? payment.paymentNumber + 1 : 1;
  }

  isPaymentNoAvailable(paymentNo, paymentDate) {
    const mPaymentDate = moment(paymentDate);
    let year = mPaymentDate.year();
    if (mPaymentDate.month() <= 5) {
      year -= 1;
    }

    const startDate = moment(`${year}-07-01 00:00:00`, 'YYYY-MM-DD hh:mm:ss');
    const endDate = moment(`${year + 1}-06-30 23:59:59`, 'YYYY-MM-DD hh:mm:ss');
    const payment = this.findOne({
      paymentNumber: paymentNo,
      paymentDate: {
        $gte: startDate.toDate(),
        $lte: endDate.toDate(),
      },
    });

    return !payment;
  }
}

export default new Payments();
