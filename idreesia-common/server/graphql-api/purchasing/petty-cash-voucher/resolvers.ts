import { PurchasingPettyCashVouchers } from 'meteor/idreesia-common/server/collections/purchasing';
import {
  approvePettyCashVoucher,
  createPettyCashVoucher,
  deletePettyCashVoucher,
  listPettyCashVouchers,
  rejectPettyCashVoucher,
  requireDateInput,
  submitPettyCashVoucher,
  updatePettyCashVoucher,
  voidPettyCashVoucher,
  type PettyCashVoucherLineInput,
} from 'meteor/idreesia-common/server/business-logic/purchasing';
import type { PettyCashVoucherStatusValue } from 'meteor/idreesia-common/constants/purchasing';

type Loader = { load(id: string): Promise<unknown> };
interface ResolverContext {
  user: { _id: string };
  loaders: {
    inventory: { physicalStores: Loader; stockItems: Loader };
    purchasing: { vendors: Loader; pettyCashFunds: Loader; pettyCashExpenseHeads: Loader };
  };
}

interface VoucherInput {
  expenseHeadId: string;
  voucherDate: string;
  payee?: string;
  vendorId?: string;
  purpose?: string;
  lines: PettyCashVoucherLineInput[];
}

export default {
  PurchasingPettyCashVoucherLine: {
    physicalStoreName: async (line: { physicalStoreId?: string }, _args: unknown, { loaders }: ResolverContext) =>
      line.physicalStoreId
        ? ((await loaders.inventory.physicalStores.load(line.physicalStoreId)) as { name?: string } | undefined)?.name
        : null,
    stockItemName: async (line: { externalCatalogId?: string }, _args: unknown, { loaders }: ResolverContext) =>
      line.externalCatalogId
        ? ((await loaders.inventory.stockItems.load(line.externalCatalogId)) as { name?: string } | undefined)?.name
        : null,
  },

  PurchasingPettyCashVoucher: {
    fund: async (voucher: { fundId: string }, _args: unknown, { loaders }: ResolverContext) =>
      loaders.purchasing.pettyCashFunds.load(voucher.fundId),
    expenseHead: async (voucher: { expenseHeadId: string }, _args: unknown, { loaders }: ResolverContext) =>
      loaders.purchasing.pettyCashExpenseHeads.load(voucher.expenseHeadId),
    vendor: async (voucher: { vendorId?: string }, _args: unknown, { loaders }: ResolverContext) =>
      voucher.vendorId ? loaders.purchasing.vendors.load(voucher.vendorId) : null,
  },

  Query: {
    purchasingPettyCashVoucherById: async (_obj: unknown, { _id }: { _id: string }) =>
      PurchasingPettyCashVouchers.findOneAsync({ _id: { $eq: _id } }),

    pagedPurchasingPettyCashVouchers: async (
      _obj: unknown,
      args: {
        search?: string;
        status?: PettyCashVoucherStatusValue;
        fundId?: string;
        expenseHeadId?: string;
        replenishmentId?: string;
        unreplenishedOnly?: boolean;
        pageIndex?: number;
        pageSize?: number;
      }
    ) => listPettyCashVouchers(args),
  },

  Mutation: {
    createPurchasingPettyCashVoucher: async (
      _obj: unknown,
      { fundId, voucherDate, ...rest }: VoucherInput & { fundId: string },
      { user }: ResolverContext
    ) =>
      createPettyCashVoucher(
        { fundId, ...rest, voucherDate: requireDateInput(voucherDate, 'The voucher date') },
        user
      ),

    updatePurchasingPettyCashVoucher: async (
      _obj: unknown,
      { _id, voucherDate, ...rest }: VoucherInput & { _id: string },
      { user }: ResolverContext
    ) =>
      updatePettyCashVoucher(
        _id,
        { ...rest, voucherDate: requireDateInput(voucherDate, 'The voucher date') },
        user
      ),

    submitPurchasingPettyCashVoucher: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) =>
      submitPettyCashVoucher(_id, user),

    deletePurchasingPettyCashVoucher: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) =>
      deletePettyCashVoucher(_id, user),

    approvePurchasingPettyCashVoucher: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) =>
      approvePettyCashVoucher(_id, user),

    rejectPurchasingPettyCashVoucher: async (
      _obj: unknown,
      { _id, reason }: { _id: string; reason: string },
      { user }: ResolverContext
    ) => rejectPettyCashVoucher(_id, reason, user),

    voidPurchasingPettyCashVoucher: async (
      _obj: unknown,
      { _id, reason }: { _id: string; reason: string },
      { user }: ResolverContext
    ) => voidPettyCashVoucher(_id, reason, user),
  },
};
