import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Payments,
  PaymentTypes,
} from 'meteor/idreesia-common/server/collections/accounts';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

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

      return Payments.getPayments(filter);
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
    createPayment(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_PAYMENTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Payments in the System.'
        );
      }

      return Payments.createPayment(values, user);
    },

    updatePayment(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_PAYMENTS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Payments in the System.'
        );
      }

      return Payments.updatePayment(values, user);
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

      return Payments.removePayment(_id, user);
    },
  },
};
