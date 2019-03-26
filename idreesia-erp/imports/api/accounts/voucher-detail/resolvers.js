import {
  AccountHeads,
  VoucherDetails,
} from "meteor/idreesia-common/collections/accounts";
import { hasInstanceAccess, hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  VoucherDetail: {
    refAccountHead: voucherDetail =>
      AccountHeads.findOne({
        _id: { $eq: voucherDetail.accountHeadId },
        companyId: { $eq: voucherDetail.companyId },
      }),
  },
  Query: {
    voucherDetailsByVoucherId(obj, { companyId, voucherId }, { user }) {
      if (
        hasInstanceAccess(user._id, companyId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_VOUCHERS,
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        return null;
      }

      return VoucherDetails.find({
        companyId: { $eq: companyId },
        voucherId: { $eq: voucherId },
      }).fetch();
    },
  },
};
