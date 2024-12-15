import dayjs from 'dayjs';
import XLSX from 'xlsx';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Locations,
  PurchaseForms,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

export function exportPurchaseForms(purchaseFormIdsString) {
  const purchaseFormIds = purchaseFormIdsString.split(',');
  const purchaseForms = PurchaseForms.find({
    _id: { $in: purchaseFormIds },
  }).fetch();

  const sheetData = purchaseForms.map(purchaseForm => {
    const purchaseDate = dayjs(Number(purchaseForm.purchaseDate)).format(
      'DD MMM, YYYY'
    );

    const person = People.findOne(purchaseForm.purchasedBy);
    const purchasedBy = person.sharedData.name;

    let locationName = '';
    if (purchaseForm.locationId) {
      const location = Locations.findOne(purchaseForm.locationId);
      locationName = location.name;
    }

    const formattedItems = purchaseForm.items.map(item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      let quantity = item.quantity;
      if (stockItem.unitOfMeasurement !== 'quantity') {
        quantity = `${quantity} ${stockItem.unitOfMeasurement}`;
      }

      return `${stockItem.name} [${quantity} ${
        item.isInflow ? 'Purchased' : 'Returned'
      }]`;
    });

    return {
      'Purchase Date': purchaseDate,
      'Purchased By': purchasedBy,
      'Location Name': locationName,
      Items: formattedItems.join('\n'),
    };
  });

  const ws = XLSX.utils.json_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Purchase Forms');
  const data = XLSX.write(wb, { type: 'buffer' });
  return Buffer.from(data);
}
