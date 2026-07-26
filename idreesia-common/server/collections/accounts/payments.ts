// @ts-nocheck
import { endOfDay, getMonth, getYear, isEqual, parse, startOfDay } from 'date-fns';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Payment as PaymentSchema } from 'meteor/idreesia-common/server/schemas/accounts';
import { Formats } from 'meteor/idreesia-common/constants';
import { get, forOwn, keys } from 'meteor/idreesia-common/utilities/lodash';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';
import {
  EntityType,
  OperationType,
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
  async createPayment(values, user) {
    const { paymentNumber, paymentDate } = values;
    if (!(await this.isPaymentNoAvailable(paymentNumber, paymentDate))) {
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

    const paymentId = await this.insertAsync(valuesToInsert);
    await AuditLogs.createAuditLog({
      entityId: paymentId,
      entityType: EntityType.PAYMENT,
      operationType: OperationType.CREATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: values,
    });

    return this.findOneAsync(paymentId);
  }

  async updatePayment(values, user) {
    const { _id } = values;
    const existingPayment = await this.findOneAsync(_id);
    const changedValues = this.getChangedValues(_id, values, existingPayment);

    if (keys(changedValues).length === 0) {
      // Nothing actually changed
      return this.findOneAsync(_id);
    }

    const date = new Date();
    const valuesToUpdate = Object.assign({}, changedValues, {
      updatedAt: date,
      updatedBy: user._id,
    });

    await this.updateAsync(_id, { $set: valuesToUpdate });

    await AuditLogs.createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.PAYMENT,
        operationType: OperationType.UPDATE,
        operationBy: user._id,
        operationTime: date,
        auditValues: changedValues,
      },
      existingPayment
    );

    return this.findOneAsync(_id);
  }

  async removePayment(_id, user) {
    const date = new Date();
    await this.updateAsync(
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

    await AuditLogs.createAuditLog({
      entityId: _id,
      entityType: EntityType.PAYMENT,
      operationType: OperationType.DELETE,
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
        isChanged = !isEqual(new Date(existingPayment[key]), new Date(newValue));
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

    const payments = await this.aggregate(pipeline);
    return payments.map(({ _id }) => _id);
  }

  async getPayments(params = {}) {
    const pipeline = [
      {
        $match: {
          isDeleted: { $eq: false },
        },
      },
    ];

    const {
      paymentNumber,
      name,
      cnicNumber,
      paymentTypeId,
      startDate,
      endDate,
      updatedBetween,
      pageIndex = '0',
      pageSize = '20',
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
            $gte: startOfDay(parseDate(startDate, Formats.DATE_FORMAT)),
          },
        },
      });
    }

    if (endDate) {
      pipeline.push({
        $match: {
          paymentDate: {
            $lte: endOfDay(parseDate(endDate, Formats.DATE_FORMAT)),
          },
        },
      });
    }

    if (updatedBetween) {
      const updatedBetweenDates = JSON.parse(updatedBetween);

      if (updatedBetweenDates[0]) {
        pipeline.push({
          $match: {
            updatedAt: {
              $gte: startOfDay(
                parseDate(updatedBetweenDates[0], Formats.DATE_FORMAT)
              ),
            },
          },
        });
      }
      if (updatedBetweenDates[1]) {
        pipeline.push({
          $match: {
            updatedAt: {
              $lte: endOfDay(
                parseDate(updatedBetweenDates[1], Formats.DATE_FORMAT)
              ),
            },
          },
        });
      }
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
    const payments = this.aggregate(resultsPipeline);
    const totalResults = this.aggregate(countingPipeline);

    return Promise.all([payments, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }

  // **************************************************************
  // Utility Functions
  // **************************************************************
  async getNextPaymentNo() {
    const currentDate = new Date();
    let year = getYear(currentDate);
    if (getMonth(currentDate) <= 5) {
      year -= 1;
    }
    const startDate = parse(`${year}-07-01 00:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date());
    const endDate = parse(`${year + 1}-06-30 23:59:59`, 'yyyy-MM-dd HH:mm:ss', new Date());
    const payment = await this.findOneAsync(
      {
        paymentDate: {
          $gte: startDate,
          $lte: endDate,
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

  async isPaymentNoAvailable(paymentNo, paymentDate) {
    const mPaymentDate = new Date(paymentDate);
    let year = getYear(mPaymentDate);
    if (getMonth(mPaymentDate) <= 5) {
      year -= 1;
    }

    const startDate = parse(`${year}-07-01 00:00:00`, 'yyyy-MM-dd HH:mm:ss', new Date());
    const endDate = parse(`${year + 1}-06-30 23:59:59`, 'yyyy-MM-dd HH:mm:ss', new Date());
    const payment = await this.findOneAsync({
      paymentNumber: paymentNo,
      paymentDate: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    return !payment;
  }
}

export default new Payments();
