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
  PurchaseFormsPrintForm,
  PurchaseFormsList,
} from './purchase-forms';
import {
  StockAdjustmentsNewForm,
  StockAdjustmentsEditForm,
  StockAdjustmentsViewForm,
  StockAdjustmentsList,
} from './stock-adjustments';

const RouterSwitch = Switch as any;
const RouterRoute = Route as any;

const Router = () => (
  <RouterSwitch>
    <RouterRoute path={paths.issuanceReportPath()} component={IssuanceReport} />
    <RouterRoute path={paths.purchasingReportPath()} component={PurchasingReport} />
    <RouterRoute path={paths.statusDashboardPath()} component={StatusDashboard} />

    <RouterRoute
      path={paths.itemCategoriesNewFormPath()}
      component={ItemCategoriesNewForm}
    />
    <RouterRoute
      path={paths.itemCategoriesEditFormPath()}
      component={ItemCategoriesEditForm}
    />
    <RouterRoute path={paths.itemCategoriesPath()} component={ItemCategoriesList} />

    <RouterRoute path={paths.vendorsNewFormPath()} component={VendorsNewForm} />
    <RouterRoute path={paths.vendorsEditFormPath()} component={VendorsEditForm} />
    <RouterRoute path={paths.vendorsPath()} component={VendorsList} />

    <RouterRoute path={paths.locationsNewFormPath()} component={LocationsNewForm} />
    <RouterRoute path={paths.locationsEditFormPath()} component={LocationsEditForm} />
    <RouterRoute path={paths.locationsPath()} component={LocationsList} />

    <RouterRoute path={paths.stockItemsNewFormPath()} component={StockItemsNewForm} />
    <RouterRoute
      path={paths.stockItemsEditFormPath()}
      component={StockItemsEditForm}
    />
    <RouterRoute path={paths.stockItemsPath()} component={StockItemsList} />

    <RouterRoute
      path={paths.issuanceFormsNewFormPath()}
      component={IssuanceFormsNewForm}
    />
    <RouterRoute
      path={paths.issuanceFormsEditFormPath()}
      component={IssuanceFormsEditForm}
    />
    <RouterRoute
      path={paths.issuanceFormsViewFormPath()}
      component={IssuanceFormsViewForm}
    />
    <RouterRoute
      path={paths.issuanceFormsPrintFormPath()}
      component={IssuanceFormsPrintForm}
    />
    <RouterRoute path={paths.issuanceFormsPath()} component={IssuanceFormsList} />

    <RouterRoute
      path={paths.purchaseFormsNewFormPath()}
      component={PurchaseFormsNewForm}
    />
    <RouterRoute
      path={paths.purchaseFormsEditFormPath()}
      component={PurchaseFormsEditForm}
    />
    <RouterRoute
      path={paths.purchaseFormsViewFormPath()}
      component={PurchaseFormsViewForm}
    />
    <RouterRoute
      path={paths.purchaseFormsPrintFormPath()}
      component={PurchaseFormsPrintForm}
    />
    <RouterRoute path={paths.purchaseFormsPath()} component={PurchaseFormsList} />

    <RouterRoute
      path={paths.stockAdjustmentsNewFormPath()}
      component={StockAdjustmentsNewForm}
    />
    <RouterRoute
      path={paths.stockAdjustmentsEditFormPath()}
      component={StockAdjustmentsEditForm}
    />
    <RouterRoute
      path={paths.stockAdjustmentsViewFormPath()}
      component={StockAdjustmentsViewForm}
    />
    <RouterRoute
      path={paths.stockAdjustmentsPath()}
      component={StockAdjustmentsList}
    />
  </RouterSwitch>
);

export default Router;
