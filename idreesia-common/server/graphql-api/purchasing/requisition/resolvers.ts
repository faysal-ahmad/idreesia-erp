import { PurchasingRequisitions } from 'meteor/idreesia-common/server/collections/purchasing';
import {
  approveRequisition,
  cancelRequisition,
  closeRequisition,
  createRequisition,
  deleteRequisition,
  listRequisitions,
  parseDateInput,
  rejectRequisition,
  reopenRequisition,
  submitRequisition,
  updateRequisition,
  type RequisitionLineInput,
} from 'meteor/idreesia-common/server/business-logic/purchasing';
import type { RequisitionStatusValue } from 'meteor/idreesia-common/constants/purchasing';

interface ResolverContext {
  user: { _id: string };
  loaders: { common: { people: { load(id: string): Promise<unknown> } } };
}

interface RequisitionArgs {
  title: string;
  purpose?: string;
  requestedBy?: string;
  neededBy?: string;
  lines: RequisitionLineInput[];
}

const toValues = ({ neededBy, ...rest }: RequisitionArgs) => ({
  ...rest,
  neededBy: parseDateInput(neededBy) ?? null,
});

export default {
  PurchasingRequisition: {
    source: (requisition: { source?: string }) => requisition.source ?? 'purchasing',
    requestedByPerson: async (
      requisition: { requestedBy?: string },
      _args: unknown,
      { loaders }: ResolverContext
    ) =>
      requisition.requestedBy
        ? loaders.common.people.load(requisition.requestedBy)
        : null,
  },

  Query: {
    purchasingRequisitionById: async (_obj: unknown, { _id }: { _id: string }) =>
      PurchasingRequisitions.findOneAsync({ _id: { $eq: _id } }),

    pagedPurchasingRequisitions: async (
      _obj: unknown,
      args: {
        search?: string;
        status?: RequisitionStatusValue;
        requestedBy?: string;
        source?: 'purchasing' | 'store';
        pageIndex?: number;
        pageSize?: number;
      }
    ) => listRequisitions(args),
  },

  Mutation: {
    createPurchasingRequisition: async (
      _obj: unknown,
      args: RequisitionArgs,
      { user }: ResolverContext
    ) => createRequisition(toValues(args), user),

    updatePurchasingRequisition: async (
      _obj: unknown,
      { _id, version, ...rest }: RequisitionArgs & { _id: string; version: number },
      { user }: ResolverContext
    ) => updateRequisition(_id, version, toValues(rest), user),

    submitPurchasingRequisition: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) =>
      submitRequisition(_id, user),

    reopenPurchasingRequisition: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) =>
      reopenRequisition(_id, user),

    cancelPurchasingRequisition: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) =>
      cancelRequisition(_id, user),

    closePurchasingRequisition: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) =>
      closeRequisition(_id, user),

    deletePurchasingRequisition: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) => {
      await deleteRequisition(_id, user);
      return true;
    },

    approvePurchasingRequisition: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) =>
      approveRequisition(_id, user),

    rejectPurchasingRequisition: async (
      _obj: unknown,
      { _id, reason }: { _id: string; reason: string },
      { user }: ResolverContext
    ) => rejectRequisition(_id, reason, user),
  },
};
