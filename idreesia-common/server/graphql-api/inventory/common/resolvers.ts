import type DataLoader from 'dataloader';

interface ItemWithQuantity {
  stockItemId: string;
}

interface ResolverContext {
  loaders: {
    inventory: {
      stockItems: DataLoader<string, unknown>;
    };
  };
}

export default {
  ItemWithQuantity: {
    refStockItem: async (
      item: ItemWithQuantity,
      _args: unknown,
      {
        loaders: {
          inventory: { stockItems },
        },
      }: ResolverContext
    ) => stockItems.load(item.stockItemId),
  },

  ItemWithQuantityAndPrice: {
    refStockItem: async (
      item: ItemWithQuantity,
      _args: unknown,
      {
        loaders: {
          inventory: { stockItems },
        },
      }: ResolverContext
    ) => stockItems.load(item.stockItemId),
  },
};
