import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import * as paths from './inventory-paths';
import { ItemTypesNewForm, ItemTypesEditForm, ItemTypesList } from './item-types';
import { default as IssuanceForm } from './issuance-form/container';
import { default as ReceivalForm } from './receival-form/container';
import { default as PurchaseOrderForm } from './purchase-order-form/container';
import { default as Report } from './reports/container';

class InventoryRouter extends Component {
  render() {
    return (
      <Switch>
        <Route path={paths.inventoryItemTypesNewFormPath} component={ItemTypesNewForm} />
        <Route path={paths.inventoryItemTypesEditFormPath} component={ItemTypesEditForm} />
        <Route path={paths.inventoryItemTypesPath} component={ItemTypesList} />

        <Route path={`${paths.inventoryPath}/issue`} component={IssuanceForm} />
        <Route path={`${paths.inventoryPath}/receive`} component={ReceivalForm} />
        <Route path={`${paths.inventoryPath}/purchase`} component={PurchaseOrderForm} />
        <Route path={`${paths.inventoryPath}/report`} component={Report} />
      </Switch>
    );
  }
}

export default InventoryRouter;
