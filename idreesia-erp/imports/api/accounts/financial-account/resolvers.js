import { FinancialAccounts } from 'meteor/idreesia-common/collections/accounts';
import { filterByInstanceAccess, hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    allFinancialAccounts(obj, params, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_VIEW_FINANCIAL_ACCOUNTS])) {
        throw new Error('You do not have permission to view Financial Accounts in the System.');
      }

      return FinancialAccounts.find({}).fetch();
    },

    allAccessibleFinancialAccounts(obj, params, { userId }) {
      const accounts = FinancialAccounts.find({}).fetch();
      const filteredFinancialAccounts = filterByInstanceAccess(userId, accounts);
      return filteredFinancialAccounts;
    },

    financialAccountById(obj, { id }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_VIEW_FINANCIAL_ACCOUNTS])) {
        throw new Error('You do not have permission to view Financial Accounts in the System.');
      }

      return FinancialAccounts.findOne(id);
    },
  },

  Mutation: {
    createFinancialAccount(obj, { name, startingBalance }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_MANAGE_FINANCIAL_ACCOUNTS])) {
        throw new Error('You do not have permission to manage Financial Accounts in the System.');
      }

      const date = new Date();
      const accountId = FinancialAccounts.insert({
        name,
        startingBalance,
        currentBalance: startingBalance,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      return FinancialAccounts.findOne(accountId);
    },

    updateFinancialAccount(obj, { id, name }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.ADMIN_MANAGE_FINANCIAL_ACCOUNTS])) {
        throw new Error('You do not have permission to manage Financial Accounts in the System.');
      }

      const date = new Date();
      FinancialAccounts.update(id, {
        $set: {
          name,
          updatedAt: date,
          updatedBy: userId,
        },
      });

      return FinancialAccounts.findOne(id);
    },
  },
};
