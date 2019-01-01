import React from "react";
import { Switch, Route } from "react-router-dom";

import { default as paths } from "./submodule-paths";
import {
  StockItemsNewForm,
  StockItemsEditForm,
  StockItemsList,
} from "./stock-items";
import {
  ItemTypesNewForm,
  ItemTypesEditForm,
  ItemTypesList,
} from "./item-types";
import {
  ItemCategoriesNewForm,
  ItemCategoriesEditForm,
  ItemCategoriesList,
} from "./item-categories";
import {
  IssuanceFormsNewForm,
  IssuanceFormsEditForm,
  IssuanceFormsViewForm,
  IssuanceFormsList,
} from "./issuance-forms";
import {
  PurchaseFormsNewForm,
  PurchaseFormsEditForm,
  PurchaseFormsList,
} from "./purchase-forms";

const InventoryRouter = () => (
  <Switch>
    <Route path={paths.itemTypesNewFormPath} component={ItemTypesNewForm} />
    <Route path={paths.itemTypesEditFormPath} component={ItemTypesEditForm} />
    <Route path={paths.itemTypesPath} component={ItemTypesList} />

    <Route
      path={paths.itemCategoriesNewFormPath}
      component={ItemCategoriesNewForm}
    />
    <Route
      path={paths.itemCategoriesEditFormPath}
      component={ItemCategoriesEditForm}
    />
    <Route path={paths.itemCategoriesPath} component={ItemCategoriesList} />

    <Route path={paths.stockItemsNewFormPath()} component={StockItemsNewForm} />
    <Route
      path={paths.stockItemsEditFormPath()}
      component={StockItemsEditForm}
    />
    <Route path={paths.stockItemsPath()} component={StockItemsList} />

    <Route
      path={paths.issuanceFormsNewFormPath()}
      component={IssuanceFormsNewForm}
    />
    <Route
      path={paths.issuanceFormsEditFormPath()}
      component={IssuanceFormsEditForm}
    />
    <Route
      path={paths.issuanceFormsViewFormPath()}
      component={IssuanceFormsViewForm}
    />
    <Route path={paths.issuanceFormsPath()} component={IssuanceFormsList} />

    <Route
      path={paths.purchaseFormsNewFormPath()}
      component={PurchaseFormsNewForm}
    />
    <Route
      path={paths.purchaseFormsEditFormPath()}
      component={PurchaseFormsEditForm}
    />
    <Route path={paths.purchaseFormsPath()} component={PurchaseFormsList} />
  </Switch>
);

export default InventoryRouter;
