import { AccountMonthlyBalances } from "meteor/idreesia-common/collections/accounts";
import {
  hasInstanceAccess,
  hasOnePermission
} from "meteor/idreesia-common/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  Query: {
    accountMonthlyBalancesByCompanyId(
      obj,
      { monthString, companyId },
      { user }
    ) {
      if (
        hasInstanceAccess(user._id, companyId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.ACCOUNTS_VIEW_ACTIVTY_SHEET
        ])
      ) {
        return [];
      }

      return AccountMonthlyBalances.find({
        companyId: { $eq: companyId },
        monthString: { $eq: monthString }
      }).fetch();
    }
  }
};
