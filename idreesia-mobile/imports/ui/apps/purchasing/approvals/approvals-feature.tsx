import React from 'react';

import { ListDetailFeature } from '../components/list-detail-feature';
import { OrderDetailScreen } from '../orders/order-detail-screen';
import { PurchasingPaths } from '../paths';
import { RequisitionDetailScreen } from '../requisitions/requisition-detail-screen';
import { ApprovalsScreen } from './approvals-screen';

const RequisitionDetail = () => <RequisitionDetailScreen backTo={PurchasingPaths.approvals} />;
const OrderDetail = () => <OrderDetailScreen backTo={PurchasingPaths.approvals} />;

/**
 * Purchasing → Approvals. The documents open under this feature's own path so
 * the approvals list (and its tab) stays alive underneath and back returns to it.
 */
export const ApprovalsFeature = () => (
  <ListDetailFeature
    basePath={PurchasingPaths.approvals}
    list={ApprovalsScreen}
    routes={[
      { path: PurchasingPaths.approvalRequisitionPattern, component: RequisitionDetail },
      { path: PurchasingPaths.approvalOrderPattern, component: OrderDetail },
    ]}
  />
);
