import dayjs from 'dayjs';

import {
  Locations,
  IssuanceForms,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { createWorkbookBuffer } from 'meteor/idreesia-common/server/business-logic/common/excel-exporter';

export async function exportIsssuanceForms(issuanceFormIdsString: string) {
  const issuanceFormIds = issuanceFormIdsString.split(',');
  const issuanceForms = await IssuanceForms.find({
    _id: { $in: issuanceFormIds },
  }).fetchAsync();

  const sheetData = await Promise.all(
    issuanceForms.map(async (issuanceForm: any) => {
      const issueDate = dayjs(Number(issuanceForm.issueDate)).format(
        'DD MMM, YYYY'
      );

      const person = (await People.findOneAsync(issuanceForm.issuedTo)) as any;
      let issuedTo = person?.sharedData?.name ?? '';
      if (issuanceForm.handedOverTo) {
        issuedTo = `${issuanceForm.handedOverTo} - [on behalf of ${issuedTo}]`;
      }

      let locationName = '';
      if (issuanceForm.locationId) {
        const location = (await Locations.findOneAsync(issuanceForm.locationId)) as any;
        locationName = location?.name ?? '';
      }

      const formattedItems = await Promise.all(
        issuanceForm.items.map(async (item: any) => {
          const stockItem = (await StockItems.findOneAsync(item.stockItemId)) as any;
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

  return createWorkbookBuffer(sheetData, 'Issuance Forms');
}
