import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { VouchersList, VouchersNewForm, VouchersEditForm } from './vouchers';
import { AccountHeadsList, AccountHeadsEditForm } from './account-heads';
import { ActivitySheetList } from './activity-sheet';
import {
  PaymentTypesNewForm,
  PaymentTypesEditForm,
  PaymentTypesList,
} from './payment-types';
import {
  PaymentsList,
  PaymentsNewForm,
  PaymentsEditForm,
  PaymentReceipts,
} from './payments';
import {
  ImdadRequestsList,
  ImdadRequestsNewForm,
  ImdadRequestsEditForm,
} from './imdad-requests';
import { AuditLogsList } from './audit-logs';

const Router = () => (
  <Switch>
    <Route
      path={paths.accountHeadsEditFormPath(':companyId')}
      component={AccountHeadsEditForm}
    />
    <Route
      path={paths.accountHeadsPath(':companyId')}
      component={AccountHeadsList}
    />

    <Route
      path={paths.activitySheetPath(':companyId')}
      component={ActivitySheetList}
    />

    <Route path={paths.vouchersNewFormPath()} component={VouchersNewForm} />
    <Route path={paths.vouchersEditFormPath()} component={VouchersEditForm} />
    <Route path={paths.vouchersPath()} component={VouchersList} />

    <Route
      path={paths.paymentTypesNewFormPath}
      component={PaymentTypesNewForm}
    />
    <Route
      path={paths.paymentTypesEditFormPath()}
      component={PaymentTypesEditForm}
    />
    <Route path={paths.paymentTypesPath} component={PaymentTypesList} />

    <Route path={paths.paymentsNewFormPath} component={PaymentsNewForm} />
    <Route path={paths.paymentReceiptsPath()} component={PaymentReceipts} />
    <Route path={paths.paymentsEditFormPath()} component={PaymentsEditForm} />
    <Route path={paths.paymentsPath} component={PaymentsList} />

    <Route
      path={paths.imdadRequestsNewFormPath}
      component={ImdadRequestsNewForm}
    />
    <Route
      path={paths.imdadRequestsEditFormPath()}
      component={ImdadRequestsEditForm}
    />
    <Route path={paths.imdadRequestsPath} component={ImdadRequestsList} />

    <Route path={paths.auditLogsPath} component={AuditLogsList} />
  </Switch>
);

export default Router;
