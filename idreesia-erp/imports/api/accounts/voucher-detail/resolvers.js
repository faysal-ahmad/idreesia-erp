import {
  AccountHeads,
  Vouchers,
  VoucherDetails,
} from "meteor/idreesia-common/collections/accounts";
import { hasInstanceAccess, hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import getVoucherDetails from "./queries";

export default {
  VoucherDetail: {
    refAccountHead: voucherDetail =>
      AccountHeads.findOne({
        _id: { $eq: voucherDetail.accountHeadId },
        companyId: { $eq: voucherDetail.companyId },
      }),

    refVoucher: voucherDetail =>
      Vouchers.findOne({
        _id: { $eq: voucherDetail.voucherId },
        companyId: { $eq: voucherDetail.companyId },
      }),
  },

  Query: {
    voucherDetailById(obj, { _id, companyId }, { user }) {
      if (
        hasInstanceAccess(user._id, companyId) === false ||
        !hasOnePermission(user._id, [
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

    voucherDetailsByVoucherId(obj, { companyId, voucherId }, { user }) {
      if (
        hasInstanceAccess(user._id, companyId) === false ||
        !hasOnePermission(user._id, [
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

    pagedVoucherDetails(
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
    ) {
      if (
        hasInstanceAccess(user._id, companyId) === false ||
        !hasOnePermission(user._id, [
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
    createVoucherDetail(
      obj,
      { companyId, voucherId, accountHeadId, description, amount, isCredit },
      { user }
    ) {
      if (
        hasInstanceAccess(user._id, companyId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Vouchers in the System."
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

    updateVoucherDetail(
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
    ) {
      if (
        hasInstanceAccess(user._id, companyId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Vouchers in the System."
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

    removeVoucherDetail(obj, { _id, companyId }, { user }) {
      if (
        hasInstanceAccess(user._id, companyId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Vouchers in the System."
        );
      }

      return VoucherDetails.remove(_id);
    },
  },
};
