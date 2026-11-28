import {
  searchPurchasingFormKarkuns,
  type FormKarkunSearchParams,
} from 'meteor/idreesia-common/server/business-logic/purchasing';

export default {
  Query: {
    pagedPurchasingKarkuns: async (_obj: unknown, args: FormKarkunSearchParams) =>
      searchPurchasingFormKarkuns(args),
  },
};
