import dayjs from 'dayjs';
import XLSX from 'xlsx';

import {
  Locations,
  IssuanceForms,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';
import { People } from 'meteor/idreesia-common/server/collections/common';

export async function exportIsssuanceForms(issuanceFormIdsString) {
  const issuanceFormIds = issuanceFormIdsString.split(',');
  const issuanceForms = await IssuanceForms.find({
    _id: { $in: issuanceFormIds },
  }).fetchAsync();

  const sheetData = await Promise.all(
    issuanceForms.map(async issuanceForm => {
      const issueDate = dayjs(Number(issuanceForm.issueDate)).format(
        'DD MMM, YYYY'
      );

      const person = await People.findOneAsync(issuanceForm.issuedTo);
      let issuedTo = person.sharedData.name;
      if (issuanceForm.handedOverTo) {
        issuedTo = `${issuanceForm.handedOverTo} - [on behalf of ${issuedTo}]`;
      }

      let locationName = '';
      if (issuanceForm.locationId) {
        const location = await Locations.findOneAsync(issuanceForm.locationId);
        locationName = location.name;
      }

      const formattedItems = await Promise.all(
        issuanceForm.items.map(async item => {
          const stockItem = await StockItems.findOneAsync(item.stockItemId);
          let quantity = item.quantity;
          if (stockItem.unitOfMeasurement !== 'quantity') {
            quantity = `${quantity} ${stockItem.unitOfMeasurement}`;
          }

          return `${stockItem.name} [${quantity} ${
            item.isInflow ? 'Returned' : 'Issued'
          }]`;
        })
      );

      return {
        'Issue Date': issueDate,
        'Issued To': issuedTo,
        'Location Name': locationName,
        Items: formattedItems.join('\n'),
      };
    })
  );

  const ws = XLSX.utils.json_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Issuance Forms');
  const data = XLSX.write(wb, { type: 'buffer' });
  return Buffer.from(data);
}
