import moment from 'moment';
import XLSX from 'xlsx';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Locations,
  IssuanceForms,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

export function exportIsssuanceForms(issuanceFormIdsString) {
  const issuanceFormIds = issuanceFormIdsString.split(',');
  const issuanceForms = IssuanceForms.find({
    _id: { $in: issuanceFormIds },
  }).fetch();

  const sheetData = issuanceForms.map(issuanceForm => {
    const issueDate = moment(Number(issuanceForm.issueDate)).format(
      'DD MMM, YYYY'
    );

    const person = People.findOne(issuanceForm.issuedTo);
    let issuedTo = person.sharedData.name;
    if (issuanceForm.handedOverTo) {
      issuedTo = `${issuanceForm.handedOverTo} - [on behalf of ${issuedTo}]`;
    }

    let locationName = '';
    if (issuanceForm.locationId) {
      const location = Locations.findOne(issuanceForm.locationId);
      locationName = location.name;
    }

    const formattedItems = issuanceForm.items.map(item => {
      const stockItem = StockItems.findOne(item.stockItemId);
      let quantity = item.quantity;
      if (stockItem.unitOfMeasurement !== 'quantity') {
        quantity = `${quantity} ${stockItem.unitOfMeasurement}`;
      }

      return `${stockItem.name} [${quantity} ${
        item.isInflow ? 'Returned' : 'Issued'
      }]`;
    });

    return {
      'Issue Date': issueDate,
      'Issued To': issuedTo,
      'Location Name': locationName,
      Items: formattedItems.join('\n'),
    };
  });

  const ws = XLSX.utils.json_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Issuance Forms');
  const data = XLSX.write(wb, { type: 'buffer' });
  return Buffer.from(data);
}
