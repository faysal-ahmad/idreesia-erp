import { PurchasingQuotes } from 'meteor/idreesia-common/server/collections/purchasing';
import {
  createQuote,
  deleteQuote,
  listQuotes,
  parseDateInput,
  rejectQuote,
  requireDateInput,
  selectQuote,
  updateQuote,
  type QuoteLineInput,
} from 'meteor/idreesia-common/server/business-logic/purchasing';
import type { QuoteStatusValue } from 'meteor/idreesia-common/constants/purchasing';

interface ResolverContext {
  user: { _id: string };
  loaders: { purchasing: { vendors: { load(id: string): Promise<unknown> } } };
}

interface QuoteArgs {
  requisitionId: string;
  vendorId: string;
  reference?: string;
  quoteDate: string;
  validUntil?: string;
  notes?: string;
  lines: QuoteLineInput[];
}

const toValues = ({ quoteDate, validUntil, ...rest }: QuoteArgs) => ({
  ...rest,
  quoteDate: requireDateInput(quoteDate, 'The quote date'),
  validUntil: parseDateInput(validUntil) ?? null,
});

export default {
  PurchasingQuote: {
    vendor: async (quote: { vendorId: string }, _args: unknown, { loaders }: ResolverContext) =>
      loaders.purchasing.vendors.load(quote.vendorId),
  },

  Query: {
    purchasingQuoteById: async (_obj: unknown, { _id }: { _id: string }) =>
      PurchasingQuotes.findOneAsync({ _id: { $eq: _id } }),

    pagedPurchasingQuotes: async (
      _obj: unknown,
      args: {
        search?: string;
        status?: QuoteStatusValue;
        vendorId?: string;
        requisitionId?: string;
        pageIndex?: number;
        pageSize?: number;
      }
    ) => listQuotes(args),
  },

  Mutation: {
    createPurchasingQuote: async (_obj: unknown, args: QuoteArgs, { user }: ResolverContext) =>
      createQuote(toValues(args), user),

    updatePurchasingQuote: async (
      _obj: unknown,
      { _id, version, ...rest }: QuoteArgs & { _id: string; version: number },
      { user }: ResolverContext
    ) => updateQuote(_id, version, toValues(rest), user),

    selectPurchasingQuote: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) =>
      selectQuote(_id, user),

    rejectPurchasingQuote: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) =>
      rejectQuote(_id, user),

    deletePurchasingQuote: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) => {
      await deleteQuote(_id, user);
      return true;
    },
  },
};
