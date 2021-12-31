import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import {
  Vouchers,
  VoucherDetails,
} from 'meteor/idreesia-common/server/collections/accounts';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getVouchers, getInfoForNewVoucher } from './queries';

export default {
  Voucher: {
    attachments: voucher => {
      const { attachmentIds } = voucher;
      if (attachmentIds && attachmentIds.length > 0) {
        return Attachments.find({ _id: { $in: attachmentIds } }).fetch();
      }

      return [];
    },
    voucherDetails: voucher =>
      VoucherDetails.find({ voucherId: { $eq: voucher._id } }).fetch(),
  },

  Query: {
    pagedVouchers(obj, { companyId, queryString }, { user }) {
      if (
        hasInstanceAccess(user, companyId) === false ||
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

      return getVouchers(companyId, queryString);
    },

    voucherById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_VOUCHERS,
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        return null;
      }

      const voucher = Vouchers.findOne(_id);
      if (hasInstanceAccess(user, voucher.companyId) === false) return null;
      return voucher;
    },
  },
  Mutation: {
    createVoucher(
      obj,
      { companyId, voucherType, voucherDate, description },
      { user }
    ) {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Vouchers in the System.'
        );
      }

      const date = new Date();
      const info = getInfoForNewVoucher(companyId, voucherType, voucherDate);
      const voucherId = Vouchers.insert({
        companyId,
        voucherNumber: info.voucherNumber,
        voucherType,
        voucherDate,
        description,
        order: info.order,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Vouchers.findOne(voucherId);
    },

    updateVoucher(obj, { _id, companyId, description }, { user }) {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Vouchers in the System.'
        );
      }

      const date = new Date();
      Vouchers.update(
        {
          _id,
          companyId,
        },
        {
          $set: {
            description,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return Vouchers.findOne(_id);
    },

    addVoucherAttachment(obj, { _id, companyId, attachmentId }, { user }) {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Vouchers in the System.'
        );
      }

      const date = new Date();
      Vouchers.update(
        {
          _id,
          companyId,
        },
        {
          $addToSet: {
            attachmentIds: attachmentId,
          },
          $set: {
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return Vouchers.findOne(_id);
    },

    removeVoucherAttachment(obj, { _id, companyId, attachmentId }, { user }) {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Vouchers in the System.'
        );
      }

      const date = new Date();
      Vouchers.update(
        { _id, companyId },
        {
          $pull: {
            attachmentIds: attachmentId,
          },
          $set: {
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      Attachments.remove(attachmentId);
      return Vouchers.findOne(_id);
    },
  },
};
