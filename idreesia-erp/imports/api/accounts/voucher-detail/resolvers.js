import {
  AccountHeads,
  VoucherDetails,
} from "meteor/idreesia-common/collections/accounts";
import { hasOnePermission } from "/imports/api/security";
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
    voucherDetailsByVoucherId(obj, { voucherId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_VOUCHERS,
          PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
        ])
      ) {
        return null;
      }

      return VoucherDetails.find({ voucherId: { $eq: voucherId } }).fetch();
    },
  },
};
