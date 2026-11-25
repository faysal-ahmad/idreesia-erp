import {
  cancelRequisition,
  createRequisition,
  deleteRequisition,
  getRequisition,
  listRequisitions,
  parseDateInput,
  reopenRequisition,
  submitRequisition,
  updateRequisition,
  type RequisitionLineInput,
} from 'meteor/idreesia-common/server/business-logic/purchasing';
import type { RequisitionStatusValue } from 'meteor/idreesia-common/constants/purchasing';

interface ResolverContext {
  user: { _id: string };
}

interface StoreArgs {
  physicalStoreId: string;
}

interface RequisitionArgs extends StoreArgs {
  title: string;
  purpose?: string;
  requestedBy?: string;
  neededBy?: string;
  lines: RequisitionLineInput[];
}

const toValues = ({ physicalStoreId, neededBy, ...rest }: RequisitionArgs) => ({
  values: { ...rest, neededBy: parseDateInput(neededBy) ?? null },
  origin: { physicalStoreId },
});

export default {
  Query: {
    // Scoped to the store's own requisitions.
    storeRequisitionById: async (_obj: unknown, { _id, physicalStoreId }: StoreArgs & { _id: string }) =>
      getRequisition(_id, { physicalStoreId }).catch(() => null),

    pagedStoreRequisitions: async (
      _obj: unknown,
      args: StoreArgs & {
        search?: string;
        status?: RequisitionStatusValue;
        pageIndex?: number;
        pageSize?: number;
      }
    ) => listRequisitions(args),
  },

  Mutation: {
    createStoreRequisition: async (_obj: unknown, args: RequisitionArgs, { user }: ResolverContext) => {
      const { values, origin } = toValues(args);
      return createRequisition(values, user, origin);
    },

    updateStoreRequisition: async (
      _obj: unknown,
      { _id, version, ...rest }: RequisitionArgs & { _id: string; version: number },
      { user }: ResolverContext
    ) => {
      const { values, origin } = toValues(rest);
      return updateRequisition(_id, version, values, user, origin);
    },

    submitStoreRequisition: async (
      _obj: unknown,
      { _id, physicalStoreId }: StoreArgs & { _id: string },
      { user }: ResolverContext
    ) => submitRequisition(_id, user, { physicalStoreId }),

    reopenStoreRequisition: async (
      _obj: unknown,
      { _id, physicalStoreId }: StoreArgs & { _id: string },
      { user }: ResolverContext
    ) => reopenRequisition(_id, user, { physicalStoreId }),

    cancelStoreRequisition: async (
      _obj: unknown,
      { _id, physicalStoreId }: StoreArgs & { _id: string },
      { user }: ResolverContext
    ) => cancelRequisition(_id, user, { physicalStoreId }),

    deleteStoreRequisition: async (
      _obj: unknown,
      { _id, physicalStoreId }: StoreArgs & { _id: string },
      { user }: ResolverContext
    ) => {
      await deleteRequisition(_id, user, { physicalStoreId });
      return true;
    },
  },
};
