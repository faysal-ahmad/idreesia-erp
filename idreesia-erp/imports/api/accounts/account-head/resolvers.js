import { AccountHeads } from "meteor/idreesia-common/collections/accounts";

export default {
  Query: {
    allAccountHeads(obj, { companyId }) {
      return AccountHeads.find({ companyId: { $eq: companyId } }).fetch();
    },
  },
};
