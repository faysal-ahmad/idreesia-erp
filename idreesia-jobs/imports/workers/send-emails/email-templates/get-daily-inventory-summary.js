import moment from "moment";
import { map } from "lodash";

import {
  Locations,
  IssuanceForms,
  PurchaseForms,
  StockItems,
  ItemTypes,
} from "meteor/idreesia-common/collections/inventory";
import { Karkuns } from "meteor/idreesia-common/collections/hr";

function getIssuanceFormsSummary(physicalStoreId) {
  const issuanceForms = IssuanceForms.getUpdatedForDate(
    physicalStoreId,
    new Date()
  );

  const issuanceFormRows = issuanceForms.map(issuanceForm => {
    const location = issuanceForm.locationId
      ? Locations.findOne(issuanceForm.locationId)
      : null;
    const issuedTo = Karkuns.findOne(issuanceForm.issuedTo);
    const formattedDate = moment(issuanceForm.issueDate).format("DD-MM-YYYY");
    const items = map(
      issuanceForm.items,
      ({ stockItemId, quantity, isInflow }) => {
        const stockItem = StockItems.findOne(stockItemId);
        const itemType = ItemTypes.findOne(stockItem.itemTypeId);
        return `<li>${itemType.formattedName} [${quantity} ${
          isInflow ? "Returned" : "Issued"
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
          location ? location.name : ""
        }</td>
        <td style="border:2px solid #ecedee; padding:0 15px">
          <mj-raw>
            <ul>
              ${items.join("")}
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
          ${issuanceFormRows.join("")}
        </mj-table>
      <mj-column>
    </mj-section>
  `;
}

function getPurchaseFormsSummary(physicalStoreId) {
  const purchaseForms = PurchaseForms.getUpdatedForDate(
    physicalStoreId,
    new Date()
  );
  const purchaseFormRows = purchaseForms.map(purchaseForm => {
    const formattedDate = moment(purchaseForm.purchaseDate).format(
      "DD-MM-YYYY"
    );
    const items = purchaseForm.items.map(
      ({ stockItemId, quantity, isInflow }) => {
        const stockItem = StockItems.findOne(stockItemId);
        const itemType = ItemTypes.findOne(stockItem.itemTypeId);
        return `<li>${itemType.formattedName} [${quantity} ${
          isInflow ? "Purchased" : "Returned"
        }]</li>`;
      }
    );

    return `
      <tr style="border:2px solid #ecedee">
        <td style="border:2px solid #ecedee; padding:0 15px;">${formattedDate}</td>
        <td style="border:2px solid #ecedee; padding:0 15px;">
          <mj-raw>
            <ul>
              ${items.join("")}
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
          ${purchaseFormRows.join("")}
        </mj-table>
      </mj-column>
    </mj-section>
  `;
}

function getAdjustmentsSummary() {
  return ``;
}

export default function getDailyInventorySummaryForStore(physicalStoreId) {
  const issuanceFormsSummary = getIssuanceFormsSummary(physicalStoreId);
  const purchaseFormsSummary = getPurchaseFormsSummary(physicalStoreId);
  const adjustmentsSummary = getAdjustmentsSummary(physicalStoreId);

  return `
    <mjml>
      <mj-head>
        <mj-style inline="inline">
          body {
            background-color: #f5f5f5;
          }
        </mj-style>
      </mj-head>
      <mj-body>
        ${issuanceFormsSummary}
        ${purchaseFormsSummary}
        ${adjustmentsSummary}
      </mj-body>
    </mjml>
  `;
}
