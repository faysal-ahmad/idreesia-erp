import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import { ModulePaths, InventorySubModulePaths as paths } from '../constants';
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
import { default as IssuanceForm } from './issuance-form/container';
import { default as ReceivalForm } from './receival-form/container';
import { default as DisposalForm } from './disposal-form/container';
import { default as LostItemForm } from './lost-item-form/container';
import { default as PurchaseOrderForm } from './purchase-order-form/container';
import { default as Report } from './reports/container';

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

        <Route path={`${ModulePaths.inventoryPath}/issue`} component={IssuanceForm} />
        <Route path={`${ModulePaths.inventoryPath}/receive`} component={ReceivalForm} />
        <Route path={`${ModulePaths.inventoryPath}/purchase`} component={PurchaseOrderForm} />
        <Route path={`${ModulePaths.inventoryPath}/dispose`} component={DisposalForm} />
        <Route path={`${ModulePaths.inventoryPath}/lost`} component={LostItemForm} />
        <Route path={`${ModulePaths.inventoryPath}/report`} component={Report} />
      </Switch>
    );
  }
}

export default InventoryRouter;
