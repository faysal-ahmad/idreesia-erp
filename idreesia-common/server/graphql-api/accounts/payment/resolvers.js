import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Payments,
  PaymentTypes,
} from 'meteor/idreesia-common/server/collections/accounts';
import { ImdadRequests } from 'meteor/idreesia-common/server/collections/imdad';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  PaymentType: {
    paymentType: async paymentType =>
      PaymentTypes.findOne({
        _id: { $eq: paymentType.paymentTypeId },
      }),
  },

  Query: {
    nextPaymentNumber: async () => Payments.getNextPaymentNo(),

    paymentById: async (obj, { _id }, { user }) => {
      if (
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_VIEW_PAYMENTS,
          PermissionConstants.ACCOUNTS_MANAGE_PAYMENTS,
        ])
      ) {
        return null;
      }

      return Payments.findOne(_id);
    },

    pagedPayments: async (obj, { filter }, { user }) => {
      if (
        !hasOnePermission(user, [
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

    pagedPaymentsForImdadRequest: async (obj, { imdadRequestId, filter }) => {
      const imdadRequest = ImdadRequests.findOne(imdadRequestId);
      const { visitorId } = imdadRequest;
      const visitor = People.findOne(visitorId);
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
    createPayment: async (obj, values, { user }) => {
      if (
        !hasOnePermission(user, [PermissionConstants.ACCOUNTS_MANAGE_PAYMENTS])
      ) {
        throw new Error(
          'You do not have permission to manage Payments in the System.'
        );
      }

      return Payments.createPayment(values, user);
    },

    updatePayment: async (obj, values, { user }) => {
      if (
        !hasOnePermission(user, [PermissionConstants.ACCOUNTS_MANAGE_PAYMENTS])
      ) {
        throw new Error(
          'You do not have permission to manage Payments in the System.'
        );
      }

      return Payments.updatePayment(values, user);
    },

    removePayment: async (obj, { _id }, { user }) => {
      if (
        !hasOnePermission(user, [PermissionConstants.ACCOUNTS_MANAGE_PAYMENTS])
      ) {
        throw new Error(
          'You do not have permission to manage Payments in the System.'
        );
      }

      return Payments.removePayment(_id, user);
    },
  },
};
