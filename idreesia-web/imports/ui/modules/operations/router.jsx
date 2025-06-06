import React from 'react';
import { Switch, Route } from 'react-router-dom';

import {
  VisitorsNewForm,
  VisitorsScanForm,
  VisitorsEditForm,
  VisitorsList,
} from './visitors';

import { WazaifInventoryList, WazaifInventoryNewForm, WazaifInventoryEditForm } from './wazaif-management/inventory';
import { WazaifStockAdjustmentsList } from './wazaif-management/stock-adjustments';
import {
  WazaifDeliveryOrdersList,
  WazaifDeliveryOrdersNewForm,
  WazaifDeliveryOrdersEditForm,
} from './wazaif-management/delivery-orders';
import {
  WazaifPrintingOrdersList,
  WazaifPrintingOrdersNewForm,
  WazaifPrintingOrdersEditForm,
} from './wazaif-management/printing-orders';
import {
  WazaifVendorsList,
  WazaifVendorsNewForm,
  WazaifVendorsEditForm,
} from './wazaif-management/vendors';
import { WazaifUsersList, WazaifUsersEditForm } from './wazaif-management/wazaif-users';

import {
  ImdadReasonsNewForm,
  ImdadReasonsEditForm,
  ImdadReasonsList,
} from './imdad-management/imdad-reasons';
import {
  ImdadRequestsList,
  ImdadRequestsNewForm,
  ImdadRequestsEditForm,
} from './imdad-management/imdad-requests';
import { ImdadRequestReport } from './imdad-management/imdad-request-report';

import { NewEhadReport } from './new-ehad-report';

import { default as paths } from './submodule-paths';

const Router = () => (
  <Switch>
    <Route path={paths.visitorsNewFormPath} component={VisitorsNewForm} />
    <Route path={paths.visitorsScanFormPath} component={VisitorsScanForm} />
    <Route path={paths.visitorsEditFormPath()} component={VisitorsEditForm} />
    <Route path={paths.visitorsPath} component={VisitorsList} />

    <Route path={paths.wazaifInventoryNewFormPath} component={WazaifInventoryNewForm} />
    <Route path={paths.wazaifInventoryEditFormPath()} component={WazaifInventoryEditForm} />
    <Route path={paths.wazaifInventoryPath} component={WazaifInventoryList} />

    <Route path={paths.wazaifStockAdjustmentPath} component={WazaifStockAdjustmentsList} />

    <Route path={paths.wazaifDeliveryOrdersNewFormPath} component={WazaifDeliveryOrdersNewForm} />
    <Route path={paths.wazaifDeliveryOrdersEditFormPath()} component={WazaifDeliveryOrdersEditForm} />
    <Route path={paths.wazaifDeliveryOrdersPath} component={WazaifDeliveryOrdersList} />

    <Route path={paths.wazaifPrintingOrdersNewFormPath} component={WazaifPrintingOrdersNewForm} />
    <Route path={paths.wazaifPrintingOrdersEditFormPath()} component={WazaifPrintingOrdersEditForm} />
    <Route path={paths.wazaifPrintingOrdersPath} component={WazaifPrintingOrdersList} />

    <Route path={paths.wazaifVendorsNewFormPath} component={WazaifVendorsNewForm} />
    <Route path={paths.wazaifVendorsEditFormPath()} component={WazaifVendorsEditForm} />
    <Route path={paths.wazaifVendorsPath} component={WazaifVendorsList} />

    <Route path={paths.wazaifUsersEditFormPath()} component={WazaifUsersEditForm} />
    <Route path={paths.wazaifUsersPath} component={WazaifUsersList} />

    <Route
      path={paths.imdadReasonsNewFormPath}
      component={ImdadReasonsNewForm}
    />
    <Route
      path={paths.imdadReasonsEditFormPath()}
      component={ImdadReasonsEditForm}
    />
    <Route path={paths.imdadReasonsPath} component={ImdadReasonsList} />

    <Route
      path={paths.imdadRequestsNewFormPath}
      component={ImdadRequestsNewForm}
    />
    <Route
      path={paths.imdadRequestsEditFormPath()}
      component={ImdadRequestsEditForm}
    />
    <Route path={paths.imdadRequestsPath} component={ImdadRequestsList} />

    <Route path={paths.newEhadReportPath} component={NewEhadReport} />
    <Route path={paths.imdadRequestReportPath} component={ImdadRequestReport} />
  </Switch>
);

export default Router;
