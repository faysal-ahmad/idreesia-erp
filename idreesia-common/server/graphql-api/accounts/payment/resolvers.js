import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Payments,
  PaymentTypes,
  ImdadRequests,
} from 'meteor/idreesia-common/server/collections/accounts';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  PaymentType: {
    paymentType: paymentType =>
      PaymentTypes.findOne({
        _id: { $eq: paymentType.paymentTypeId },
      }),
  },

  Query: {
    nextPaymentNumber() {
      return Payments.getNextPaymentNo();
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

    pagedPaymentsForImdadRequest(obj, { imdadRequestId, filter }) {
      const imdadRequest = ImdadRequests.findOne(imdadRequestId);
      const { visitorId } = imdadRequest;
      const visitor = Visitors.findOne(visitorId);
      if (!visitor.cnicNumber) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return Payments.getPayments({
        ...filter,
        cnicNumber: visitor.cnicNumber,
      });
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
