import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { ModulePaths } from '/imports/ui/constants';
import { StockItemsNewForm, StockItemsList } from './stock-items';
import { ItemTypesNewForm, ItemTypesEditForm, ItemTypesList } from './item-types';
import {
  ItemCategoriesNewForm,
  ItemCategoriesEditForm,
  ItemCategoriesList
} from './item-categories';
import {
  PhysicalStoresNewForm,
  PhysicalStoresEditForm,
  PhysicalStoresList
} from './physical-stores';
import { IssuanceFormsNewForm, IssuanceFormsEditForm, IssuanceFormsList } from './issuance-forms';
import { ReceivalFormsNewForm, ReceivalFormsEditForm, ReceivalFormsList } from './receival-forms';
import {
  AdjustmentFormsNewForm,
  AdjustmentFormsEditForm,
  AdjustmentFormsList
} from './adjustment-forms';
import {
  PurchaseOrderFormsNewForm,
  PurchaseOrderFormsEditForm,
  PurchaseOrderFormsList
} from './purchase-order-forms';

class InventoryRouter extends Component {
  render() {
    return (
      <Switch>
        <Route path={paths.stockItemsNewFormPath} component={StockItemsNewForm} />
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

        <Route path={paths.issuanceFormsListPath} component={IssuanceFormsList} />
        <Route path={paths.issuanceFormsNewFormPath} component={IssuanceFormsNewForm} />
        <Route path={paths.issuanceFormsEditFormPath} component={IssuanceFormsEditForm} />

        <Route path={paths.receivalFormsNewFormPath} component={ReceivalFormsNewForm} />
        <Route path={paths.receivalFormsEditFormPath} component={ReceivalFormsEditForm} />
        <Route path={paths.receivalFormsListPath} component={ReceivalFormsList} />

        <Route path={paths.adjustmentFormsNewFormPath} component={AdjustmentFormsNewForm} />
        <Route path={paths.adjustmentFormsEditFormPath} component={AdjustmentFormsEditForm} />
        <Route path={paths.adjustmentFormsListPath} component={AdjustmentFormsList} />

        <Route path={paths.purchaseOrderFormsNewFormPath} component={PurchaseOrderFormsNewForm} />
        <Route path={paths.purchaseOrderFormsEditFormPath} component={PurchaseOrderFormsEditForm} />
        <Route path={paths.purchaseOrderFormsListPath} component={PurchaseOrderFormsList} />
      </Switch>
    );
  }
}

export default InventoryRouter;