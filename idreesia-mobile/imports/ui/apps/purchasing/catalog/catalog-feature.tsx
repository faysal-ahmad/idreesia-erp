import React from 'react';

import { ListDetailFeature } from '../components/list-detail-feature';
import { PurchasingPaths } from '../paths';
import { CatalogItemScreen, CatalogListScreen } from './catalog-screens';

/** Purchasing → Catalog. Owns every route under PurchasingPaths.catalog. */
export const CatalogFeature = () => (
  <ListDetailFeature
    basePath={PurchasingPaths.catalog}
    list={CatalogListScreen}
    routes={[{ path: PurchasingPaths.catalogItemPattern, component: CatalogItemScreen }]}
  />
);
