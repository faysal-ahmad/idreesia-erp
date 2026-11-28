import {
  searchStoreKarkuns,
  type StoreKarkunSearchParams,
} from 'meteor/idreesia-common/server/business-logic/inventory';

export default {
  Query: {
    pagedStoreKarkuns: async (_obj: unknown, args: StoreKarkunSearchParams) =>
      searchStoreKarkuns(args),
  },
};
