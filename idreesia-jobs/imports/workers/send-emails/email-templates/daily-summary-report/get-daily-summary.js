import getIssuanceFormsSummary from "./get-issuance-forms-summary";
import getPurchaseFormsSummary from "./get-purchase-forms-summary";

function getAdjustmentsSummary() {
  return ``;
}

export default function getDailySummary(physicalStoreId) {
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
