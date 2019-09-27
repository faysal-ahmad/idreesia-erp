import { reduce } from 'lodash';
import {
  StockItems,
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';

function mergeIssuanceForms(ids, physicalStoreId) {
  const firstId = ids[0];
  const otherIds = ids.slice(1);

  const issuanceForms = IssuanceForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $in: otherIds },
      },
    },
  }).fetch();

  issuanceForms.forEach(issuanceForm => {
    const { items } = issuanceForm;
    const updatedItems = items.map(item => {
      if (otherIds.indexOf(item.stockItemId) !== -1) {
        return Object.assign({}, item, { stockItemId: firstId });
      }

      return item;
    });

    IssuanceForms.update(issuanceForm._id, {
      $set: { items: updatedItems },
    });
  });
}

function mergePurchaseForms(ids, physicalStoreId) {
  const firstId = ids[0];
  const otherIds = ids.slice(1);

  const purchaseForms = PurchaseForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $in: otherIds },
      },
    },
  }).fetch();

  purchaseForms.forEach(purchaseForm => {
    const { items } = purchaseForm;
    const updatedItems = items.map(item => {
      if (otherIds.indexOf(item.stockItemId) !== -1) {
        return Object.assign({}, item, { stockItemId: firstId });
      }

      return item;
    });

    PurchaseForms.update(purchaseForm._id, {
      $set: { items: updatedItems },
    });
  });
}

function mergeStockAdjustments(ids, physicalStoreId) {
  const firstId = ids[0];
  const otherIds = ids.slice(1);

  StockAdjustments.update(
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

function mergeStartingStockLevels(ids, physicalStoreId) {
  const stockItems = StockItems.find({
    physicalStoreId: { $eq: physicalStoreId },
    _id: { $in: ids },
  }).fetch();

  const newStartingStockLevel = reduce(
    stockItems,
    (accumulator, { startingStockLevel }) => accumulator + startingStockLevel,
    0
  );

  StockItems.update(
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

export function recalculateStockLevels(id, physicalStoreId) {
  const stockItem = StockItems.findOne(id);
  const { startingStockLevel } = stockItem;
  let currentStockLevel = startingStockLevel;

  const issuanceForms = IssuanceForms.find({
    physicalStoreId: { $eq: physicalStoreId },
    items: {
      $elemMatch: {
        stockItemId: { $eq: id },
      },
    },
  }).fetch();

  issuanceForms.forEach(issuanceForm => {
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
  }).fetch();

  purchaseForms.forEach(purchaseForm => {
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
  }).fetch();

  stockAdjustments.forEach(({ isInflow, quantity }) => {
    currentStockLevel = isInflow
      ? currentStockLevel + quantity
      : currentStockLevel - quantity;
  });

  // Update the recalculated stock level in the stock item
  StockItems.update(id, {
    $set: { currentStockLevel },
  });
}

export function mergeStockItems(ids, physicalStoreId) {
  mergeIssuanceForms(ids, physicalStoreId);
  mergePurchaseForms(ids, physicalStoreId);
  mergeStockAdjustments(ids, physicalStoreId);
  mergeStartingStockLevels(ids, physicalStoreId);
  recalculateStockLevels(ids[0], physicalStoreId);

  const otherIds = ids.slice(1);
  StockItems.remove({
    _id: { $in: otherIds },
  });
}
