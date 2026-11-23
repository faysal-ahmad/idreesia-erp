import React from 'react';

import { ListDetailFeature } from '../components/list-detail-feature';
import { PurchasingPaths } from '../paths';
import { VendorDetailScreen, VendorsListScreen } from './vendors-screens';

/** Purchasing → Vendors. Owns every route under PurchasingPaths.vendors. */
export const VendorsFeature = () => (
  <ListDetailFeature
    basePath={PurchasingPaths.vendors}
    list={VendorsListScreen}
    routes={[{ path: PurchasingPaths.vendorPattern, component: VendorDetailScreen }]}
  />
);
