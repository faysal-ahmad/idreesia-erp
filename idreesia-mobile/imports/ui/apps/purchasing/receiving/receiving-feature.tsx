import React from 'react';

import { ListDetailFeature } from '../components/list-detail-feature';
import { PurchasingPaths } from '../paths';
import { ReceiveScreen } from './receive-screen';
import { ReceivingListScreen } from './receiving-list-screen';

/** Purchasing → Receiving. Owns every route under PurchasingPaths.receiving. */
export const ReceivingFeature = () => (
  <ListDetailFeature
    basePath={PurchasingPaths.receiving}
    list={ReceivingListScreen}
    routes={[{ path: PurchasingPaths.receivePattern, component: ReceiveScreen }]}
  />
);
