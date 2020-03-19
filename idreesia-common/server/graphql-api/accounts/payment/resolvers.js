import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Payments } from 'meteor/idreesia-common/server/collections/accounts';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getPayments } from './queries';

export default {
  Query: {
    pagedPayments(obj, { queryString }, { user }) {
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

      return getPayments(queryString);
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
