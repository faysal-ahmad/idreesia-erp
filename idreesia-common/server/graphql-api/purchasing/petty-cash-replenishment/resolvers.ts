import { PurchasingPettyCashReplenishments } from 'meteor/idreesia-common/server/collections/purchasing';
import {
  approvePettyCashReplenishment,
  listPettyCashReplenishments,
  rejectPettyCashReplenishment,
  requestPettyCashReplenishment,
  type PettyCashReplenishmentValues,
} from 'meteor/idreesia-common/server/business-logic/purchasing';
import type { PettyCashReplenishmentStatusValue } from 'meteor/idreesia-common/constants/purchasing';

type Loader = { load(id: string): Promise<unknown> };
interface ResolverContext {
  user: { _id: string };
  loaders: { purchasing: { pettyCashFunds: Loader } };
}

export default {
  PurchasingPettyCashReplenishment: {
    fund: async (replenishment: { fundId: string }, _args: unknown, { loaders }: ResolverContext) =>
      loaders.purchasing.pettyCashFunds.load(replenishment.fundId),
  },

  Query: {
    purchasingPettyCashReplenishmentById: async (_obj: unknown, { _id }: { _id: string }) =>
      PurchasingPettyCashReplenishments.findOneAsync({ _id: { $eq: _id } }),

    pagedPurchasingPettyCashReplenishments: async (
      _obj: unknown,
      args: {
        search?: string;
        status?: PettyCashReplenishmentStatusValue;
        fundId?: string;
        pageIndex?: number;
        pageSize?: number;
      }
    ) => listPettyCashReplenishments(args),
  },

  Mutation: {
    requestPurchasingPettyCashReplenishment: async (
      _obj: unknown,
      values: PettyCashReplenishmentValues,
      { user }: ResolverContext
    ) => requestPettyCashReplenishment(values, user),

    approvePurchasingPettyCashReplenishment: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: ResolverContext
    ) => approvePettyCashReplenishment(_id, user),

    rejectPurchasingPettyCashReplenishment: async (
      _obj: unknown,
      { _id, reason }: { _id: string; reason: string },
      { user }: ResolverContext
    ) => rejectPettyCashReplenishment(_id, reason, user),
  },
};
