import {
  dashboardCounts,
  openOrders,
  parseDateInput,
  payablesAging,
  spendingByMonth,
  spendingByVendor,
  vendorLedger,
} from 'meteor/idreesia-common/server/business-logic/purchasing';

type Loader = { load(id: string): Promise<unknown> };
interface ResolverContext {
  loaders: { purchasing: { vendors: Loader } };
}

type Range = { fromDate?: string; toDate?: string };
const toRange = ({ fromDate, toDate }: Range) => ({
  fromDate: parseDateInput(fromDate),
  toDate: parseDateInput(toDate),
});

const vendorField = async (
  row: { vendorId: string },
  _args: unknown,
  { loaders }: ResolverContext
) => loaders.purchasing.vendors.load(row.vendorId);

export default {
  PurchasingVendorSpending: { vendor: vendorField },
  PurchasingOpenOrder: { vendor: vendorField },
  PurchasingPayablesAgingRow: { vendor: vendorField },

  Query: {
    purchasingDashboard: async () => dashboardCounts(),

    purchasingSpendingByVendor: async (_obj: unknown, args: Range) =>
      spendingByVendor(toRange(args)),

    purchasingSpendingByMonth: async (_obj: unknown, args: Range) =>
      spendingByMonth(toRange(args)),

    purchasingOpenOrders: async () => openOrders(),

    purchasingPayablesAging: async () => payablesAging(),

    purchasingVendorLedger: async (
      _obj: unknown,
      { vendorId, ...range }: Range & { vendorId: string }
    ) => vendorLedger(vendorId, toRange(range)),
  },
};
