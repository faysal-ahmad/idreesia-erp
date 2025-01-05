import { reduce } from 'meteor/idreesia-common/utilities/lodash';
import {
  StockItems,
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

async function mergeIssuanceForms(ids, physicalStoreId) {
  const firstId = ids[0];
  const otherIds = ids.slice(1);

  const issuanceForms = await IssuanceForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $in: otherIds },
      },
    },
  }).fetchAsync();

  await Promise.all(
    issuanceForms.map(issuanceForm => {
      const { items } = issuanceForm;
      const updatedItems = items.map(item => {
        if (otherIds.indexOf(item.stockItemId) !== -1) {
          return Object.assign({}, item, { stockItemId: firstId });
        }

        return item;
      });

      return IssuanceForms.updateAsync(issuanceForm._id, {
        $set: { items: updatedItems },
      });
    })
  );
}

async function mergePurchaseForms(ids, physicalStoreId) {
  const firstId = ids[0];
  const otherIds = ids.slice(1);

  const purchaseForms = await PurchaseForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $in: otherIds },
      },
    },
  }).fetchAsync();

  await Promise.all(
    purchaseForms.map(purchaseForm => {
      const { items } = purchaseForm;
      const updatedItems = items.map(item => {
        if (otherIds.indexOf(item.stockItemId) !== -1) {
          return Object.assign({}, item, { stockItemId: firstId });
        }

        return item;
      });

      return PurchaseForms.updateAsync(purchaseForm._id, {
        $set: { items: updatedItems },
      });
    })
  );
}

async function mergeStockAdjustments(ids, physicalStoreId) {
  const firstId = ids[0];
  const otherIds = ids.slice(1);

  return StockAdjustments.updateAsync(
    {
      physicalStoreId: { $eq: physicalStoreId },
      stockItemId: { $in: otherIds },
    },
    {
      $set: {
        stockItemId: firstId,
      },
    },
    { multi: true }
  );
}

async function mergeStartingStockLevels(ids, physicalStoreId) {
  const stockItems = await StockItems.find({
    physicalStoreId: { $eq: physicalStoreId },
    _id: { $in: ids },
  }).fetchAsync();

  const newStartingStockLevel = reduce(
    stockItems,
    (accumulator, { startingStockLevel }) => accumulator + startingStockLevel,
    0
  );

  return StockItems.updateAsync(
    {
      physicalStoreId: { $eq: physicalStoreId },
      _id: { $eq: ids[0] },
    },
    {
      $set: {
        startingStockLevel: newStartingStockLevel,
      },
    }
  );
}

export async function recalculateStockLevels(id, physicalStoreId) {
  const stockItem = await StockItems.findOneAsync(id);
  const { startingStockLevel } = stockItem;
  let currentStockLevel = startingStockLevel;

  const issuanceForms = await IssuanceForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $eq: id },
      },
    },
  });

  await issuanceForms.forEachAsync(issuanceForm => {
    const { items } = issuanceForm;
    items.forEach(({ stockItemId, isInflow, quantity }) => {
      if (stockItemId === id) {
        currentStockLevel = isInflow
          ? currentStockLevel + quantity
          : currentStockLevel - quantity;
      }
    });
  });

  const purchaseForms = PurchaseForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $eq: id },
      },
    },
  });

  await purchaseForms.forEachAsync(purchaseForm => {
    const { items } = purchaseForm;
    items.forEach(({ stockItemId, isInflow, quantity }) => {
      if (stockItemId === id) {
        currentStockLevel = isInflow
          ? currentStockLevel + quantity
          : currentStockLevel - quantity;
      }
    });
  });

  const stockAdjustments = StockAdjustments.find({
    physicalStoreId: { $eq: physicalStoreId },
    stockItemId: { $eq: id },
  });

  await stockAdjustments.forEachAsync(({ isInflow, quantity }) => {
    currentStockLevel = isInflow
      ? currentStockLevel + quantity
      : currentStockLevel - quantity;
  });

  // Update the recalculated stock level in the stock item
  return StockItems.updateAsync(id, {
    $set: { currentStockLevel },
  });
}

export async function mergeStockItems(ids, physicalStoreId) {
  await mergeIssuanceForms(ids, physicalStoreId);
  await mergePurchaseForms(ids, physicalStoreId);
  await mergeStockAdjustments(ids, physicalStoreId);
  await mergeStartingStockLevels(ids, physicalStoreId);
  await recalculateStockLevels(ids[0], physicalStoreId);

  const otherIds = ids.slice(1);
  StockItems.removeAsync({
    _id: { $in: otherIds },
  });
}
