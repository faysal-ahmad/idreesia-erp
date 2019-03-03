import { AccountHeads } from "meteor/idreesia-common/collections/accounts";

export default {
  Query: {
    accountHeadsByCompanyId(obj, { companyId }) {
      return AccountHeads.find({ companyId: { $eq: companyId } }).fetch();
    },
  },
};
