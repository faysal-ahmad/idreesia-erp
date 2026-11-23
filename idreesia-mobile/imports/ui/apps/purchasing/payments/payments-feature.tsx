import React from 'react';

import { ListDetailFeature } from '../components/list-detail-feature';
import { PurchasingPaths } from '../paths';
import { PaymentDetailScreen, PaymentsListScreen } from './payments-screens';

/** Purchasing → Payments. Owns every route under PurchasingPaths.payments. */
export const PaymentsFeature = () => (
  <ListDetailFeature
    basePath={PurchasingPaths.payments}
    list={PaymentsListScreen}
    routes={[{ path: PurchasingPaths.paymentPattern, component: PaymentDetailScreen }]}
  />
);
