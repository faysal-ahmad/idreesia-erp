import moment from 'moment';

import {
  PurchaseForms,
  StockItems,
} from 'meteor/idreesia-common/collections/inventory';

export default function getAdjustmentsSummary(physicalStoreId, date) {
  const purchaseForms = PurchaseForms.getUpdatedForDate(physicalStoreId, date);
  const purchaseFormRows = purchaseForms.map(purchaseForm => {
    const formattedDate = moment(purchaseForm.purchaseDate).format(
      'DD-MM-YYYY'
    );
    const items = purchaseForm.items.map(
      ({ stockItemId, quantity, isInflow }) => {
        const stockItem = StockItems.findOne(stockItemId);
        return `<li>${stockItem.formattedName} [${quantity} ${
          isInflow ? 'Purchased' : 'Returned'
        }]</li>`;
      }
    );

    return `
      <tr style="border:2px solid #ecedee">
        <td style="border:2px solid #ecedee; padding:0 15px;">${formattedDate}</td>
        <td style="border:2px solid #ecedee; padding:0 15px;">
          <mj-raw>
            <ul>
              ${items.join('')}
            </ul>
          </mj-raw>
        </td>
      </tr>
    `;
  });

  return `
    <mj-section full-width="full-width">
      <mj-column full-width="full-width">
        <mj-text>
          <h2>Purchase & Return Summary.</h2>
        </mj-text>
        <mj-table>
          <tr style="border:2px solid #ecedee;text-align:left;padding:15px 0;">
            <th style="border:2px solid #ecedee; padding:0 15px;">Purchase Date</th>
            <th style="border:2px solid #ecedee; padding:0 15px;">Item Details</th>
          </tr>
          ${purchaseFormRows.join('')}
        </mj-table>
      </mj-column>
    </mj-section>
  `;
}
