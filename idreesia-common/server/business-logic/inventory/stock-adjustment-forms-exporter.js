import dayjs from 'dayjs';
import XLSX from 'xlsx';

import {
  StockAdjustments,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';
import { People } from 'meteor/idreesia-common/server/collections/common';

function getFormattedName(stockItem) {
  const { name, company, details } = stockItem;
  let formattedName = name;
  if (company) {
    formattedName = `${formattedName} - ${company}`;
  }
  if (details) {
    formattedName = `${formattedName} - ${details}`;
  }

  return formattedName;
}

export async function exportStockAdjustmentForms(stockAdjustmentFormIdsString) {
  const stockAdjustmentFormIds = stockAdjustmentFormIdsString.split(',');
  const stockAdjustmentForms = await StockAdjustments.find({
    _id: { $in: stockAdjustmentFormIds },
  }).fetchAsync();

  const sheetData = await Promise.all(
    stockAdjustmentForms.map(async stockAdjustmentForm => {
      const adjustmentDate = dayjs(
        Number(stockAdjustmentForm.adjustmentDate)
      ).format('DD MMM, YYYY');

      const stockItem = await StockItems.findOneAsync(
        stockAdjustmentForm.stockItemId
      );
      const person = await People.findOneAsync(stockAdjustmentForm.adjustedBy);
      const adjustedBy = person.sharedData.name;

      const adjustment = stockAdjustmentForm.isInflow
        ? `Increased by ${stockAdjustmentForm.quantity}`
        : `Decreased by ${stockAdjustmentForm.quantity}`;

      return {
        Name: getFormattedName(stockItem),
        Adjustment: adjustment,
        'Adjustment Date': adjustmentDate,
        'Adjusted By': adjustedBy,
        'Adjustment Reason': stockAdjustmentForm.adjustmentReason,
      };
    })
  );

  const ws = XLSX.utils.json_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Adjustment Forms');
  const data = XLSX.write(wb, { type: 'buffer' });
  return Buffer.from(data);
}
