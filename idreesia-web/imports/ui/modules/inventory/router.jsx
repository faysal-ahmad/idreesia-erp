import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { IssuanceReport } from './issuance-report';
import { PurchasingReport } from './purchasing-report';
import { StatusDashboard } from './status-dashboard';
import {
  StockItemsNewForm,
  StockItemsEditForm,
  StockItemsList,
} from './stock-items';
import { VendorsNewForm, VendorsEditForm, VendorsList } from './vendors';
import {
  ItemCategoriesNewForm,
  ItemCategoriesEditForm,
  ItemCategoriesList,
} from './item-categories';
import {
  LocationsNewForm,
  LocationsEditForm,
  LocationsList,
} from './locations';
import {
  IssuanceFormsNewForm,
  IssuanceFormsEditForm,
  IssuanceFormsViewForm,
  IssuanceFormsPrintForm,
  IssuanceFormsList,
} from './issuance-forms';
import {
  PurchaseFormsNewForm,
  PurchaseFormsEditForm,
  PurchaseFormsViewForm,
  PurchaseFormsList,
} from './purchase-forms';
import {
  StockAdjustmentsNewForm,
  StockAdjustmentsEditForm,
  StockAdjustmentsViewForm,
  StockAdjustmentsList,
} from './stock-adjustments';

const Router = () => (
  <Switch>
    <Route path={paths.issuanceReportPath()} component={IssuanceReport} />
    <Route path={paths.purchasingReportPath()} component={PurchasingReport} />
    <Route path={paths.statusDashboardPath()} component={StatusDashboard} />

    <Route
      path={paths.itemCategoriesNewFormPath()}
      component={ItemCategoriesNewForm}
    />
    <Route
      path={paths.itemCategoriesEditFormPath()}
      component={ItemCategoriesEditForm}
    />
    <Route path={paths.itemCategoriesPath()} component={ItemCategoriesList} />

    <Route path={paths.vendorsNewFormPath()} component={VendorsNewForm} />
    <Route path={paths.vendorsEditFormPath()} component={VendorsEditForm} />
    <Route path={paths.vendorsPath()} component={VendorsList} />

    <Route path={paths.locationsNewFormPath()} component={LocationsNewForm} />
    <Route path={paths.locationsEditFormPath()} component={LocationsEditForm} />
    <Route path={paths.locationsPath()} component={LocationsList} />

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
    <Route
      path={paths.issuanceFormsPrintFormPath()}
      component={IssuanceFormsPrintForm}
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
    <Route
      path={paths.purchaseFormsViewFormPath()}
      component={PurchaseFormsViewForm}
    />
    <Route path={paths.purchaseFormsPath()} component={PurchaseFormsList} />

    <Route
      path={paths.stockAdjustmentsNewFormPath()}
      component={StockAdjustmentsNewForm}
    />
    <Route
      path={paths.stockAdjustmentsEditFormPath()}
      component={StockAdjustmentsEditForm}
    />
    <Route
      path={paths.stockAdjustmentsViewFormPath()}
      component={StockAdjustmentsViewForm}
    />
    <Route
      path={paths.stockAdjustmentsPath()}
      component={StockAdjustmentsList}
    />
  </Switch>
);

export default Router;
