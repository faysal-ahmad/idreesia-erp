import { AccountMonthlyBalances } from 'meteor/idreesia-common/server/collections/accounts';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    accountMonthlyBalancesByCompanyId: async (
      obj,
      { monthString, companyId },
      { user }
    ) => {
      if (
        hasInstanceAccess(user, companyId) === false ||
        !hasOnePermission(user, [
          PermissionConstants.ACCOUNTS_VIEW_ACTIVTY_SHEET,
        ])
      ) {
        return [];
      }

      return AccountMonthlyBalances.find({
        companyId: { $eq: companyId },
        monthString: { $eq: monthString },
      }).fetch();
    },
  },
};
