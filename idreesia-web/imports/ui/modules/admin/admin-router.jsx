import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import {
  AdminJobsList,
  AdminJobsNewAccountsImport,
  AdminJobsNewVouchersImport,
  AdminJobsNewAccountsCalculation,
} from './admin-jobs';
import {
  AccountsNewForm,
  AccountsEditForm,
  AccountsList,
} from './security-accounts';
import {
  PhysicalStoresNewForm,
  PhysicalStoresEditForm,
  PhysicalStoresList,
} from './physical-stores';
import {
  CompaniesNewForm,
  CompaniesEditForm,
  CompaniesList,
} from './companies';

const AdminRouter = () => (
  <Switch>
    <Route
      path={paths.adminJobsNewAccountsImportPath}
      component={AdminJobsNewAccountsImport}
    />
    <Route
      path={paths.adminJobsNewVouchersImportPath}
      component={AdminJobsNewVouchersImport}
    />
    <Route
      path={paths.adminJobsNewAccountsCalculationPath}
      component={AdminJobsNewAccountsCalculation}
    />
    <Route path={paths.adminJobsPath} component={AdminJobsList} />

    <Route path={paths.accountsNewFormPath} component={AccountsNewForm} />
    <Route path={paths.accountsEditFormPath} component={AccountsEditForm} />
    <Route path={paths.accountsPath} component={AccountsList} />

    <Route
      path={paths.physicalStoresNewFormPath}
      component={PhysicalStoresNewForm}
    />
    <Route
      path={paths.physicalStoresEditFormPath}
      component={PhysicalStoresEditForm}
    />
    <Route path={paths.physicalStoresPath} component={PhysicalStoresList} />

    <Route path={paths.companiesNewFormPath} component={CompaniesNewForm} />
    <Route path={paths.companiesEditFormPath} component={CompaniesEditForm} />
    <Route path={paths.companiesPath} component={CompaniesList} />
  </Switch>
);

export default AdminRouter;
