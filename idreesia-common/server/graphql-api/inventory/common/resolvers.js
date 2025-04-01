export default {
  ItemWithQuantity: {
    refStockItem: async (
      item,
      args,
      {
        loaders: {
          inventory: { stockItems },
        },
      }
    ) => stockItems.load(item.stockItemId),
  },

  ItemWithQuantityAndPrice: {
    refStockItem: async (
      item,
      args,
      {
        loaders: {
          inventory: { stockItems },
        },
      }
    ) => stockItems.load(item.stockItemId),
  },
};
