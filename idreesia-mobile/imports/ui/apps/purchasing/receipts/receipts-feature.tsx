import React from 'react';

import { ListDetailFeature } from '../components/list-detail-feature';
import { PurchasingPaths } from '../paths';
import { ReceiptDetailScreen, ReceiptsListScreen } from './receipts-screens';

/** Purchasing → Goods receipts. Owns every route under PurchasingPaths.receipts. */
export const ReceiptsFeature = () => (
  <ListDetailFeature
    basePath={PurchasingPaths.receipts}
    list={ReceiptsListScreen}
    routes={[{ path: PurchasingPaths.receiptPattern, component: ReceiptDetailScreen }]}
  />
);
