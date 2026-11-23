import React from 'react';

import { ListDetailFeature } from '../components/list-detail-feature';
import { PurchasingPaths } from '../paths';
import { OrderDetailScreen } from './order-detail-screen';
import { OrdersListScreen } from './orders-list-screen';

const Detail = () => <OrderDetailScreen />;

/** Purchasing → Purchase orders. Owns every route under PurchasingPaths.orders. */
export const OrdersFeature = () => (
  <ListDetailFeature
    basePath={PurchasingPaths.orders}
    list={OrdersListScreen}
    routes={[{ path: PurchasingPaths.orderPattern, component: Detail }]}
  />
);
