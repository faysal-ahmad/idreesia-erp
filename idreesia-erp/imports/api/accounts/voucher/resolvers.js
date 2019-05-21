import { Vouchers } from "meteor/idreesia-common/collections/accounts";
import { hasInstanceAccess, hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import getVouchers from "./queries";

export default {
  Query: {
    pagedVouchers(obj, { companyId, queryString }, { user }) {
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

      return getVouchers(companyId, queryString);
    },

    voucherById(obj, { id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_VOUCHERS,
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        return null;
      }

      const voucher = Vouchers.findOne(id);
      if (hasInstanceAccess(user._id, voucher.companyId) === false) return null;
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
        hasInstanceAccess(user._id, companyId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Vouchers in the System."
        );

        // TODO: Create Voucher
      }
    },
  },
};
