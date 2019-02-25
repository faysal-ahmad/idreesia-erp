import { Categories } from "meteor/idreesia-common/collections/accounts";

export default {
  Query: {
    allAccountHeads(obj, { companyId }) {
      return Categories.find({ companyId: { $eq: companyId } }).fetch();
    },
  },
};
