import { Vouchers } from "meteor/idreesia-common/collections/accounts";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import getVouchers from "./queries";

export default {
  Query: {
    pagedVouchers(obj, { companyId, queryString }, { user }) {
      if (
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

      return Vouchers.findOne(id);
    },
  },
};
