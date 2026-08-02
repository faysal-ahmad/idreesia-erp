import {
  StockItems,
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

interface ItemEntry extends Record<string, unknown> {
  stockItemId: string;
  isInflow?: boolean;
  quantity: number;
}

interface FormWithItems {
  _id?: string;
  items?: ItemEntry[];
}

interface StockLevelChange {
  isInflow?: boolean;
  quantity: number;
}

async function mergeIssuanceForms(
  _idToKeep: string,
  _idsToMerge: string[],
  physicalStoreId: string
) {
  const issuanceForms = await IssuanceForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $in: _idsToMerge },
      },
    },
  }).fetchAsync() as FormWithItems[];

  await Promise.all(
    issuanceForms.map(issuanceForm => {
      const { items = [] } = issuanceForm;
      const updatedItems = items.map(item => {
        if (_idsToMerge.indexOf(item.stockItemId) !== -1) {
          return Object.assign({}, item, { stockItemId: _idToKeep });
        }

        return item;
      });

      if (!issuanceForm._id) return Promise.resolve(0);
      return IssuanceForms.updateAsync(issuanceForm._id, {
        $set: { items: updatedItems },
      });
    })
  );
}

async function mergePurchaseForms(
  _idToKeep: string,
  _idsToMerge: string[],
  physicalStoreId: string
) {
  const purchaseForms = await PurchaseForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $in: _idsToMerge },
      },
    },
  }).fetchAsync() as FormWithItems[];

  await Promise.all(
    purchaseForms.map(purchaseForm => {
      const { items = [] } = purchaseForm;
      const updatedItems = items.map(item => {
        if (_idsToMerge.indexOf(item.stockItemId) !== -1) {
          return Object.assign({}, item, { stockItemId: _idToKeep });
        }

        return item;
      });

      if (!purchaseForm._id) return Promise.resolve(0);
      return PurchaseForms.updateAsync(purchaseForm._id, {
        $set: { items: updatedItems },
      });
    })
  );
}

async function mergeStockAdjustments(
  _idToKeep: string,
  _idsToMerge: string[],
  physicalStoreId: string
) {
  return StockAdjustments.updateAsync(
    {
      physicalStoreId: { $eq: physicalStoreId },
      stockItemId: { $in: _idsToMerge },
    },
    {
      $set: {
        stockItemId: _idToKeep,
      },
    },
    { multi: true }
  );
}

async function mergeStartingStockLevels(
  _idToKeep: string,
  _idsToMerge: string[],
  physicalStoreId: string
) {
  const stockItems = await StockItems.find({
    physicalStoreId: { $eq: physicalStoreId },
    _id: { $in: [_idToKeep, ..._idsToMerge] },
  }).fetchAsync();

  const newStartingStockLevel = stockItems.reduce(
    (accumulator: number, { startingStockLevel = 0 }) =>
      accumulator + startingStockLevel,
    0
  );

  return StockItems.updateAsync(
    {
      physicalStoreId: { $eq: physicalStoreId },
      _id: { $eq: _idToKeep },
    },
    {
      $set: {
        startingStockLevel: newStartingStockLevel,
      },
    }
  );
}

export async function recalculateStockLevels(id: string, physicalStoreId: string) {
  const stockItem = await StockItems.findOneAsync(id);
  const { startingStockLevel = 0 } = stockItem ?? {};
  let currentStockLevel = startingStockLevel;

  const issuanceForms = await IssuanceForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $eq: id },
      },
    },
  });

  await issuanceForms.forEachAsync((issuanceForm: FormWithItems) => {
    const { items = [] } = issuanceForm;
    items.forEach(({ stockItemId, isInflow, quantity }) => {
      if (stockItemId === id) {
        currentStockLevel = isInflow
          ? currentStockLevel + quantity
          : currentStockLevel - quantity;
      }
    });
  });

  const purchaseForms = await PurchaseForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $eq: id },
      },
    },
  });

  await purchaseForms.forEachAsync((purchaseForm: FormWithItems) => {
    const { items = [] } = purchaseForm;
    items.forEach(({ stockItemId, isInflow, quantity }) => {
      if (stockItemId === id) {
        currentStockLevel = isInflow
          ? currentStockLevel + quantity
          : currentStockLevel - quantity;
      }
    });
  });

  const stockAdjustments = await StockAdjustments.find({
    physicalStoreId: { $eq: physicalStoreId },
    stockItemId: { $eq: id },
  });

  await stockAdjustments.forEachAsync((stockAdjustmentRecord: unknown) => {
    const { isInflow, quantity } = stockAdjustmentRecord as unknown as StockLevelChange;
    currentStockLevel = isInflow
      ? currentStockLevel + quantity
      : currentStockLevel - quantity;
  });

  // Update the recalculated stock level in the stock item
  return StockItems.updateAsync(id, {
    $set: { currentStockLevel },
  });
}

export async function mergeStockItems(
  _idToKeep: string,
  _idsToMerge: string[],
  physicalStoreId: string
) {
  await mergeIssuanceForms(_idToKeep, _idsToMerge, physicalStoreId);
  await mergePurchaseForms(_idToKeep, _idsToMerge, physicalStoreId);
  await mergeStockAdjustments(_idToKeep, _idsToMerge, physicalStoreId);
  await mergeStartingStockLevels(_idToKeep, _idsToMerge, physicalStoreId);
  await recalculateStockLevels(_idToKeep, physicalStoreId);

  return StockItems.removeAsync({
    _id: { $in: _idsToMerge },
  });
}
