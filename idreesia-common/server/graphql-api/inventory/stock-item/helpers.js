import { reduce } from 'meteor/idreesia-common/utilities/lodash';
import {
  StockItems,
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

async function mergeIssuanceForms(_idToKeep, _idsToMerge, physicalStoreId) {
  const issuanceForms = await IssuanceForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $in: _idsToMerge },
      },
    },
  }).fetchAsync();

  await Promise.all(
    issuanceForms.map(issuanceForm => {
      const { items } = issuanceForm;
      const updatedItems = items.map(item => {
        if (_idsToMerge.indexOf(item.stockItemId) !== -1) {
          return Object.assign({}, item, { stockItemId: _idToKeep });
        }

        return item;
      });

      return IssuanceForms.updateAsync(issuanceForm._id, {
        $set: { items: updatedItems },
      });
    })
  );
}

async function mergePurchaseForms(_idToKeep, _idsToMerge, physicalStoreId) {
  const purchaseForms = await PurchaseForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $in: _idsToMerge },
      },
    },
  }).fetchAsync();

  await Promise.all(
    purchaseForms.map(purchaseForm => {
      const { items } = purchaseForm;
      const updatedItems = items.map(item => {
        if (_idsToMerge.indexOf(item.stockItemId) !== -1) {
          return Object.assign({}, item, { stockItemId: _idToKeep });
        }

        return item;
      });

      return PurchaseForms.updateAsync(purchaseForm._id, {
        $set: { items: updatedItems },
      });
    })
  );
}

async function mergeStockAdjustments(_idToKeep, _idsToMerge, physicalStoreId) {
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
  _idToKeep,
  _idsToMerge,
  physicalStoreId
) {
  const stockItems = await StockItems.find({
    physicalStoreId: { $eq: physicalStoreId },
    _id: { $in: [_idToKeep, ..._idsToMerge] },
  }).fetchAsync();

  const newStartingStockLevel = reduce(
    stockItems,
    (accumulator, { startingStockLevel }) => accumulator + startingStockLevel,
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

export async function mergeStockItems(_idToKeep, _idsToMerge, physicalStoreId) {
  await mergeIssuanceForms(_idToKeep, _idsToMerge, physicalStoreId);
  await mergePurchaseForms(_idToKeep, _idsToMerge, physicalStoreId);
  await mergeStockAdjustments(_idToKeep, _idsToMerge, physicalStoreId);
  await mergeStartingStockLevels(_idToKeep, _idsToMerge, physicalStoreId);
  await recalculateStockLevels(_idToKeep, physicalStoreId);

  return StockItems.removeAsync({
    _id: { $in: _idsToMerge },
  });
}
