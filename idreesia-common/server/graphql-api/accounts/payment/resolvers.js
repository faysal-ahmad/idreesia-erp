import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Payments,
  PaymentTypes,
} from 'meteor/idreesia-common/server/collections/accounts';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getPayments } from './queries';

export default {
  PaymentType: {
    paymentType: paymentType =>
      PaymentTypes.findOne({
        _id: { $eq: paymentType.paymentTypeId },
      }),
  },

  Query: {
    pagedPayments(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_PAYMENTS,
          PermissionConstants.ACCOUNTS_MANAGE_PAYMENTS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getPayments(filter);
    },

    paymentById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_PAYMENTS,
          PermissionConstants.ACCOUNTS_MANAGE_PAYMENTS,
        ])
      ) {
        return null;
      }

      return Payments.findOne(_id);
    },

    nextPaymentNumber() {
      return Payments.getNextPaymentNo();
    },
  },
  Mutation: {
    createPayment(
      obj,
      {
        paymentNumber,
        name,
        fatherName,
        cnicNumber,
        contactNumber,
        paymentTypeId,
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

      if (!Payments.isPaymentNoAvailable(paymentNumber, paymentDate)) {
        throw new Error('This Voucher Number is already used.');
      }

      const date = new Date();
      const paymentId = Payments.insert({
        paymentNumber,
        name,
        fatherName,
        cnicNumber,
        contactNumber,
        paymentTypeId,
        paymentAmount,
        description,
        paymentDate,
        isDeleted: false,
        createdAt: date,
        updatedAt: date,
        updatedBy: user._id,
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
        paymentTypeId,
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
            paymentTypeId,
            paymentAmount,
            paymentDate,
            description,
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

      return true;
    },
  },
};
