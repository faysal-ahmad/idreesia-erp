import {
  PurchasingPettyCashExpenseHeads,
  PurchasingPettyCashVouchers,
} from 'meteor/idreesia-common/server/collections/purchasing';
import {
  createPettyCashExpenseHead,
  deletePettyCashExpenseHead,
  listPettyCashExpenseHeads,
  setPettyCashExpenseHeadActive,
  updatePettyCashExpenseHead,
  type PettyCashExpenseHeadValues,
} from 'meteor/idreesia-common/server/business-logic/purchasing';

interface ResolverContext {
  user: { _id: string };
}

export default {
  PurchasingPettyCashExpenseHead: {
    inUse: async (head: { _id: string }) =>
      !!(await PurchasingPettyCashVouchers.findOneAsync({ expenseHeadId: { $eq: head._id } })),
  },

  Query: {
    purchasingPettyCashExpenseHeadById: async (_obj: unknown, { _id }: { _id: string }) =>
      PurchasingPettyCashExpenseHeads.findOneAsync({ _id: { $eq: _id } }),

    pagedPurchasingPettyCashExpenseHeads: async (
      _obj: unknown,
      args: { search?: string; isActive?: boolean; pageIndex?: number; pageSize?: number }
    ) => listPettyCashExpenseHeads(args),
  },

  Mutation: {
    createPurchasingPettyCashExpenseHead: async (
      _obj: unknown,
      values: PettyCashExpenseHeadValues,
      { user }: ResolverContext
    ) => createPettyCashExpenseHead(values, user),

    updatePurchasingPettyCashExpenseHead: async (
      _obj: unknown,
      { _id, ...values }: PettyCashExpenseHeadValues & { _id: string },
      { user }: ResolverContext
    ) => updatePettyCashExpenseHead(_id, values, user),

    setPurchasingPettyCashExpenseHeadActive: async (
      _obj: unknown,
      { _id, isActive }: { _id: string; isActive: boolean },
      { user }: ResolverContext
    ) => setPettyCashExpenseHeadActive(_id, isActive, user),

    deletePurchasingPettyCashExpenseHead: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: ResolverContext
    ) => deletePettyCashExpenseHead(_id, user),
  },
};
