import { ImdadRequests } from 'meteor/idreesia-common/server/collections/imdad';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    accountsImdadRequestById(obj, { _id }) {
      return ImdadRequests.findOne(_id);
    },

    pagedAccountsImdadRequests(obj, { filter }) {
      return ImdadRequests.getPagedData(filter);
    },
  },

  Mutation: {
    createAccountsImdadRequest(obj, values, { user }) {
      return ImdadRequests.createImdadRequest(
        {
          dataSource: DataSource.ACCOUNTS,
          ...values,
        },
        user
      );
    },

    updateAccountsImdadRequest(obj, values, { user }) {
      return ImdadRequests.updateImdadRequest(values, user);
    },

    deleteAccountsImdadRequest(obj, { _id }) {
      return ImdadRequests.remove(_id);
    },

    setAccountsApprovedImdad(obj, values, { user }) {
      return ImdadRequests.updateImdadRequest(values, user);
    },

    addAccountsImdadRequestAttachment(obj, values, { user }) {
      return ImdadRequests.addAttachment(values, user);
    },

    removeAccountsImdadRequestAttachment(obj, values, { user }) {
      return ImdadRequests.removeAttachment(values, user);
    },
  },
};
