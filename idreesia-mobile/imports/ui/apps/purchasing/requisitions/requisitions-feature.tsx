import React from 'react';

import { ListDetailFeature } from '../components/list-detail-feature';
import { PurchasingPaths } from '../paths';
import { RequisitionDetailScreen } from './requisition-detail-screen';
import { RequisitionFormScreen } from './requisition-form-screen';
import { RequisitionsListScreen } from './requisitions-list-screen';

const Detail = () => <RequisitionDetailScreen />;

/** Purchasing → Requisitions. Owns every route under PurchasingPaths.requisitions. */
export const RequisitionsFeature = () => (
  <ListDetailFeature
    basePath={PurchasingPaths.requisitions}
    list={RequisitionsListScreen}
    routes={[
      { path: PurchasingPaths.requisitionNew, component: RequisitionFormScreen },
      { path: PurchasingPaths.requisitionEditPattern, component: RequisitionFormScreen },
      { path: PurchasingPaths.requisitionPattern, component: Detail },
    ]}
  />
);
