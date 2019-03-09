import { AccountHeads } from "meteor/idreesia-common/collections/accounts";

export default {
  AccountHead: {
    hasChildren: accountHead => {
      const childCount = AccountHeads.find({
        companyId: accountHead.companyId,
        parent: accountHead.number,
      }).count();

      return childCount > 0;
    },
  },
  Query: {
    accountHeadById(obj, { _id }) {
      return AccountHeads.findOne({ _id });
    },
    accountHeadsByCompanyId(obj, { companyId }) {
      return AccountHeads.find({ companyId: { $eq: companyId } }).fetch();
    },
  },
};
