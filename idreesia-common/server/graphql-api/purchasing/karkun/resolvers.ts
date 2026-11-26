import {
  searchPurchasingFormKarkuns,
  type KarkunSearchParams,
} from 'meteor/idreesia-common/server/business-logic/purchasing';

export default {
  Query: {
    pagedPurchasingKarkuns: async (_obj: unknown, args: KarkunSearchParams) =>
      searchPurchasingFormKarkuns(args),
  },
};
