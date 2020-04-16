import {
  Payments,
  PaymentTypes,
} from 'meteor/idreesia-common/server/collections/accounts';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  PaymentTypeType: {
    usedCount: paymentType =>
      Payments.find({
        paymentTypeId: { $eq: paymentType._id },
      }).count(),
  },

  Query: {
    allPaymentTypes() {
      return PaymentTypes.find({}, { sort: { name: 1 } }).fetch();
    },
    paymentTypeById(obj, { id }) {
      return PaymentTypes.findOne(id);
    },
  },

  Mutation: {
    createPaymentType(obj, { name, description }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_SETUP_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Payment Type Setup Data in the System.'
        );
      }

      const date = new Date();
      const paymentTypeId = PaymentTypes.insert({
        name,
        description,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return PaymentTypes.findOne(paymentTypeId);
    },

    updatePaymentType(obj, { _id, name, description }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_SETUP_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Payment Type Setup Data in the System.'
        );
      }

      const date = new Date();
      PaymentTypes.update(_id, {
        $set: {
          name,
          description,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return PaymentTypes.findOne(_id);
    },

    removePaymentType(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_SETUP_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Payment Type Setup Data in the System.'
        );
      }

      // Make sure this is not being used in any payment
      const usedCount = Payments.find({ paymentTypeId: _id }).count();
      if (usedCount > 0) {
        throw new Error(
          'The Payment Type cannot be deleted as it is being used.'
        );
      }

      return PaymentTypes.remove(_id);
    },
  },
};
