import {
  AccountHeads,
  Vouchers,
  VoucherDetails,
} from 'meteor/idreesia-common/server/collections/accounts';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import getVoucherDetails from './queries';

export default {
  VoucherDetail: {
    refAccountHead: async voucherDetail =>
      AccountHeads.findOne({
        _id: { $eq: voucherDetail.accountHeadId },
        companyId: { $eq: voucherDetail.companyId },
      }),

    refVoucher: async voucherDetail =>
      Vouchers.findOne({
        _id: { $eq: voucherDetail.voucherId },
        companyId: { $eq: voucherDetail.companyId },
      }),
  },

  Query: {
    voucherDetailById: async (obj, { _id, companyId }, { user }) => {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_VIEW_VOUCHERS,
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        return null;
      }

      return VoucherDetails.findOne({
        _id,
        companyId,
      });
    },

    voucherDetailsByVoucherId: async (
      obj,
      { companyId, voucherId },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_VIEW_VOUCHERS,
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        return [];
      }

      return VoucherDetails.find({
        companyId: { $eq: companyId },
        voucherId: { $eq: voucherId },
      }).fetch();
    },

    pagedVoucherDetails: async (
      obj,
      {
        companyId,
        accountHeadIds,
        startDate,
        endDate,
        includeCredits,
        includeDebits,
        pageIndex,
        pageSize,
      },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_VIEW_VOUCHERS,
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getVoucherDetails(
        companyId,
        accountHeadIds,
        startDate,
        endDate,
        includeCredits,
        includeDebits,
        pageIndex,
        pageSize
      );
    },
  },

  Mutation: {
    createVoucherDetail: async (
      obj,
      { companyId, voucherId, accountHeadId, description, amount, isCredit },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user, [PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS])
      ) {
        throw new Error(
          'You do not have permission to manage Vouchers in the System.'
        );
      }

      const date = new Date();
      const voucherDetailId = VoucherDetails.insert({
        companyId,
        voucherId,
        accountHeadId,
        description,
        amount,
        isCredit,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return VoucherDetails.findOne(voucherDetailId);
    },

    updateVoucherDetail: async (
      obj,
      {
        _id,
        companyId,
        voucherId,
        accountHeadId,
        description,
        amount,
        isCredit,
      },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user, [PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS])
      ) {
        throw new Error(
          'You do not have permission to manage Vouchers in the System.'
        );
      }

      const date = new Date();
      VoucherDetails.update(
        {
          _id,
          companyId,
          voucherId,
        },
        {
          $set: {
            accountHeadId,
            description,
            amount,
            isCredit,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return VoucherDetails.findOne(_id);
    },

    removeVoucherDetail: async (obj, { _id, companyId }, { user }) => {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user, [PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS])
      ) {
        throw new Error(
          'You do not have permission to manage Vouchers in the System.'
        );
      }

      return VoucherDetails.remove(_id);
    },
  },
};
