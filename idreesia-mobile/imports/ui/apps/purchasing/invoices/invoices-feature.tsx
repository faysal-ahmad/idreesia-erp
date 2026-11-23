import React from 'react';

import { ListDetailFeature } from '../components/list-detail-feature';
import { PurchasingPaths } from '../paths';
import { InvoiceDetailScreen, InvoicesListScreen } from './invoices-screens';

/** Purchasing → Invoices. Owns every route under PurchasingPaths.invoices. */
export const InvoicesFeature = () => (
  <ListDetailFeature
    basePath={PurchasingPaths.invoices}
    list={InvoicesListScreen}
    routes={[{ path: PurchasingPaths.invoicePattern, component: InvoiceDetailScreen }]}
  />
);
