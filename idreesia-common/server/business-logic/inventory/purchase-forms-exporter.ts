import dayjs from 'dayjs';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Locations,
  PurchaseForms,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';
import { createWorkbookBuffer } from 'meteor/idreesia-common/server/business-logic/common/excel-exporter';

/** The physical stores of the given forms (comma-separated ids); unknown ids are skipped. */
export async function getPurchaseFormStoreIds(purchaseFormIdsString: string) {
  const forms = await PurchaseForms.find(
    { _id: { $in: purchaseFormIdsString.split(',') } },
    { fields: { physicalStoreId: 1 } }
  ).fetchAsync();
  return forms.map(form => form.physicalStoreId as string);
}

export async function exportPurchaseForms(purchaseFormIdsString: string) {
  const purchaseFormIds = purchaseFormIdsString.split(',');
  const purchaseForms = await PurchaseForms.find({
    _id: { $in: purchaseFormIds },
  }).fetchAsync();

  const sheetData = await Promise.all(
    purchaseForms.map(async (purchaseForm: any) => {
      const purchaseDate = dayjs(Number(purchaseForm.purchaseDate)).format(
        'DD MMM, YYYY'
      );

      const person = (await People.findOneAsync(purchaseForm.purchasedBy)) as any;
      const purchasedBy = person?.sharedData?.name ?? '';

      let locationName = '';
      if (purchaseForm.locationId) {
        const location = (await Locations.findOneAsync(purchaseForm.locationId)) as any;
        locationName = location?.name ?? '';
      }

      const formattedItems = await Promise.all(
        purchaseForm.items.map(async (item: any) => {
          const stockItem = (await StockItems.findOneAsync(item.stockItemId)) as any;
          let quantity = item.quantity;
          if (stockItem.unitOfMeasurement !== 'quantity') {
            quantity = `${quantity} ${stockItem.unitOfMeasurement}`;
          }

          return `${stockItem.name} [${quantity} ${
            item.isInflow ? 'Purchased' : 'Returned'
          }]`;
        })
      );

      return {
        'Purchase Date': purchaseDate,
        'Purchased By': purchasedBy,
        'Location Name': locationName,
        Items: formattedItems.join('\n'),
      };
    })
  );

  return createWorkbookBuffer(sheetData, 'Purchase Forms');
}
