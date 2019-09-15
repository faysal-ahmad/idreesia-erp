import moment from 'moment';

import getIssuanceFormsSummary from './get-issuance-forms-summary';
import getPurchaseFormsSummary from './get-purchase-forms-summary';

function getAdjustmentsSummary() {
  return ``;
}

export default function getDailySummary(physicalStoreId) {
  const m = moment().subtract(1, 'day');
  const issuanceFormsSummary = getIssuanceFormsSummary(
    physicalStoreId,
    m.toDate()
  );
  const purchaseFormsSummary = getPurchaseFormsSummary(
    physicalStoreId,
    m.toDate()
  );
  const adjustmentsSummary = getAdjustmentsSummary(physicalStoreId, m.toDate());

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
