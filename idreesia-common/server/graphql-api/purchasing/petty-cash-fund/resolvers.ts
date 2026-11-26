import { PurchasingPettyCashFunds } from 'meteor/idreesia-common/server/collections/purchasing';
import {
  createPettyCashFund,
  listPettyCashFunds,
  searchPurchasingPermissionHolders,
  setPettyCashFundActive,
  updatePettyCashFund,
  type PettyCashFundValues,
} from 'meteor/idreesia-common/server/business-logic/purchasing';

type Loader = { load(id: string): Promise<unknown> };
interface ResolverContext {
  user: { _id: string };
  loaders: { common: { people: Loader } };
}

export default {
  PurchasingPettyCashFund: {
    custodian: async (fund: { custodianPersonId: string }, _args: unknown, { loaders }: ResolverContext) =>
      loaders.common.people.load(fund.custodianPersonId),
  },

  Query: {
    purchasingPettyCashFundById: async (_obj: unknown, { _id }: { _id: string }) =>
      PurchasingPettyCashFunds.findOneAsync({ _id: { $eq: _id } }),

    purchasingPettyCashCustodianSearch: async (
      _obj: unknown,
      args: {
        name?: string;
        cnicNumber?: string;
        phoneNumber?: string;
        pageIndex?: string;
        pageSize?: string;
      }
    ) => searchPurchasingPermissionHolders(args),

    pagedPurchasingPettyCashFunds: async (
      _obj: unknown,
      args: { search?: string; isActive?: boolean; pageIndex?: number; pageSize?: number }
    ) => listPettyCashFunds(args),
  },

  Mutation: {
    createPurchasingPettyCashFund: async (
      _obj: unknown,
      values: PettyCashFundValues,
      { user }: ResolverContext
    ) => createPettyCashFund(values, user),

    updatePurchasingPettyCashFund: async (
      _obj: unknown,
      { _id, ...values }: PettyCashFundValues & { _id: string },
      { user }: ResolverContext
    ) => updatePettyCashFund(_id, values, user),

    setPurchasingPettyCashFundActive: async (
      _obj: unknown,
      { _id, isActive }: { _id: string; isActive: boolean },
      { user }: ResolverContext
    ) => setPettyCashFundActive(_id, isActive, user),
  },
};
