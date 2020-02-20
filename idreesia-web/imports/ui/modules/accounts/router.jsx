import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { VouchersList, VouchersNewForm, VouchersEditForm } from './vouchers';
import { AccountHeadsList, AccountHeadsEditForm } from './account-heads';
import { ActivitySheetList } from './activity-sheet';
import {
  PaymentsList,
  PaymentsNewForm,
  PaymentsEditForm,
  PaymentReceipts,
} from './payments';

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

    <Route path={paths.paymentsNewFormPath} component={PaymentsNewForm} />
    <Route path={paths.paymentReceiptsPath()} component={PaymentReceipts} />
    <Route path={paths.paymentsEditFormPath()} component={PaymentsEditForm} />
    <Route path={paths.paymentsPath} component={PaymentsList} />
  </Switch>
);

export default Router;
