import moment from 'moment';

import { map } from 'meteor/idreesia-common/utilities/lodash';
import {
  Locations,
  IssuanceForms,
  StockItems,
} from 'meteor/idreesia-common/collections/inventory';
import { Karkuns } from 'meteor/idreesia-common/collections/hr';

export default function getIssuanceFormsSummary(physicalStoreId, date) {
  const issuanceForms = IssuanceForms.getUpdatedForDate(physicalStoreId, date);

  const issuanceFormRows = issuanceForms.map(issuanceForm => {
    const location = issuanceForm.locationId
      ? Locations.findOne(issuanceForm.locationId)
      : null;
    const issuedTo = Karkuns.findOne(issuanceForm.issuedTo);
    const formattedDate = moment(issuanceForm.issueDate).format('DD-MM-YYYY');
    const items = map(
      issuanceForm.items,
      ({ stockItemId, quantity, isInflow }) => {
        const stockItem = StockItems.findOne(stockItemId);
        return `<li>${stockItem.formattedName} [${quantity} ${
          isInflow ? 'Returned' : 'Issued'
        }]</li>`;
      }
    );

    return `
      <tr style="border:2px solid #ecedee">
        <td style="border:2px solid #ecedee; padding:0 15px;">${formattedDate}</td>
        <td style="border:2px solid #ecedee; padding:0 15px;">${
          issuedTo.name
        }</td>
        <td style="border:2px solid #ecedee; padding:0 15px;">${
          location ? location.name : ''
        }</td>
        <td style="border:2px solid #ecedee; padding:0 15px">
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
          <h2>Issue & Return Summary.</h2>
        </mj-text>
        <mj-table width="100%">
          <tr style="border:2px solid #ecedee;text-align:left">
            <th style="border:2px solid #ecedee; padding:0 15px;">Issue Date</th>
            <th style="border:2px solid #ecedee; padding:0 15px;">Issued To</th>
            <th style="border:2px solid #ecedee; padding:0 15px;">For Location</th>
            <th style="border:2px solid #ecedee; padding:0 15px;">Item Details</th>
          </tr>
          ${issuanceFormRows.join('')}
        </mj-table>
      <mj-column>
    </mj-section>
  `;
}
