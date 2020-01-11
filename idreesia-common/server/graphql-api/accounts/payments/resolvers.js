import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Payments } from 'meteor/idreesia-common/server/collections/accounts';
import { PaymentsHistory } from 'meteor/idreesia-common/server/collections/accounts';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getPayments } from './queries';

export default {
  Query: {
    pagedPayments(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_PAYMENTS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getPayments(queryString);
    },

    paymentById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_PAYMENTS,
        ])
      ) {
        return null;
      }

      const payment = Payments.findOne(_id);
      return payment;
    },
  },
  Mutation: {
    createPayment(
      obj,
      {
        name,
        fatherName,
        cnicNumber,
        contactNumber,
        paymentType,
        paymentAmount,
        paymentDate,
        description,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_PAYMENTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Payments in the System.'
        );
      }
      const date = new Date();
      const paymentNumber = Payments.getNextPaymentNo(paymentType, date);
      const paymentId = Payments.insert({
        name,
        fatherName,
        cnicNumber,
        contactNumber,
        paymentNumber,
        paymentType,
        paymentAmount,
        date,
        description,
        paymentDate,
        isDeleted: false,
        createdAt: date,
        updatedAt: date,
        updatedBy: user._id,
        approvedBy: user._id,
        createdBy: user._id,
      });
      return Payments.findOne(paymentId);
    },

    updatePayment(
      obj,
      {
        _id,
        name,
        fatherName,
        cnicNumber,
        contactNumber,
        paymentType,
        paymentAmount,
        paymentDate,
        description,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_PAYMENTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Payments in the System.'
        );
      }
      const date = new Date();
      const payment = Payments.findOne(_id);
      const version = PaymentsHistory.getNextVersionForPaymentHistory(_id);
      PaymentsHistory.insert({
        paymentId: payment._id,
        version,
        name: payment.name,
        fatherName: payment.fatherName,
        cnicNumber: payment.cnicNumber,
        contactNumber: payment.contactNumber,
        paymentNumber: payment.paymentNumber,
        paymentType: payment.paymentType,
        paymentAmount: payment.paymentAmount,
        date: payment.date,
        description: payment.description,
        paymentDate: payment.paymentDate,
        createdAt: date,
        updatedAt: date,
        updatedBy: user._id,
        approvedBy: user._id,
        createdBy: user._id,
      });

      Payments.update(
        {
          _id,
        },
        {
          $set: {
            name,
            fatherName,
            cnicNumber,
            contactNumber,
            paymentType,
            paymentAmount,
            paymentDate,
            description,
            approvedBy: user._id,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return Payments.findOne(_id);
    },

    removePayment(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_PAYMENTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Payments in the System.'
        );
      }
      const date = new Date();
      Payments.update(
        {
          _id,
        },
        {
          $set: {
            isDeleted: true,
            updatedAt: date,
            updatedBy: user._id,
            deletedAt: date,
            deletedBy: user._id,
          },
        }
      );
      const payment = Payments.findOne(_id);
      PaymentsHistory.insert({
        paymentId: payment._id,
        name: payment.name,
        fatherName: payment.fatherName,
        cnicNumber: payment.cnicNumber,
        contactNumber: payment.contactNumber,
        paymentNumber: payment.paymentNumber,
        paymentType: payment.paymentType,
        paymentAmount: payment.paymentAmount,
        date: payment.date,
        description: payment.description,
        paymentDate: payment.paymentDate,
        isDeleted: true,
        createdAt: date,
        updatedAt: date,
        deletedAt: date,
        approvedBy: user._id,
        createdBy: user._id,
        updatedBy: user._id,
        deletedBy: user._id,
      });
    },
  },
};
