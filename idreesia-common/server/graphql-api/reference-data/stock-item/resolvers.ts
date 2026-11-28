import { getPagedStockItems } from 'meteor/idreesia-common/server/business-logic/inventory/stock-item-search';

export default {
  Query: {
    referenceStockItems: async (
      _obj: unknown,
      { physicalStoreId, name }: { physicalStoreId: string; name?: string }
    ) => {
      const query = new URLSearchParams({ name: name ?? '', pageSize: '50' }).toString();
      const { data } = await getPagedStockItems(query, physicalStoreId);
      return data;
    },
  },
};
