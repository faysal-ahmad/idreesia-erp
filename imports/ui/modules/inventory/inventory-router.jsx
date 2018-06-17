import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { StockItemsNewForm, StockItemsEditForm, StockItemsList } from './stock-items';
import { ItemTypesNewForm, ItemTypesEditForm, ItemTypesList } from './item-types';
import {
  ItemCategoriesNewForm,
  ItemCategoriesEditForm,
  ItemCategoriesList,
} from './item-categories';
import {
  PhysicalStoresNewForm,
  PhysicalStoresEditForm,
  PhysicalStoresList,
} from './physical-stores';
import { IssuanceFormsNewForm, IssuanceFormsEditForm, IssuanceFormsList } from './issuance-forms';
import { ReturnFormsNewForm, ReturnFormsEditForm, ReturnFormsList } from './return-forms';

const InventoryRouter = () => (
  <Switch>
    <Route path={paths.stockItemsNewFormPath} component={StockItemsNewForm} />
    <Route path={paths.stockItemsEditFormPath} component={StockItemsEditForm} />
    <Route path={paths.stockItemsPath} component={StockItemsList} />

    <Route path={paths.itemTypesNewFormPath} component={ItemTypesNewForm} />
    <Route path={paths.itemTypesEditFormPath} component={ItemTypesEditForm} />
    <Route path={paths.itemTypesPath} component={ItemTypesList} />

    <Route path={paths.itemCategoriesNewFormPath} component={ItemCategoriesNewForm} />
    <Route path={paths.itemCategoriesEditFormPath} component={ItemCategoriesEditForm} />
    <Route path={paths.itemCategoriesPath} component={ItemCategoriesList} />

    <Route path={paths.physicalStoresNewFormPath} component={PhysicalStoresNewForm} />
    <Route path={paths.physicalStoresEditFormPath} component={PhysicalStoresEditForm} />
    <Route path={paths.physicalStoresPath} component={PhysicalStoresList} />

    <Route path={paths.issuanceFormsNewFormPath} component={IssuanceFormsNewForm} />
    <Route path={paths.issuanceFormsEditFormPath} component={IssuanceFormsEditForm} />
    <Route path={paths.issuanceFormsPath} component={IssuanceFormsList} />

    <Route path={paths.returnFormsNewFormPath} component={ReturnFormsNewForm} />
    <Route path={paths.returnFormsEditFormPath} component={ReturnFormsEditForm} />
    <Route path={paths.returnFormsPath} component={ReturnFormsList} />
  </Switch>
);

export default InventoryRouter;
