import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import {
  AdminJobsList,
  AdminJobsNewAccountsImport,
  AdminJobsNewVouchersImport,
  AdminJobsNewAccountsCalculation,
} from './admin-jobs';
import { UsersNewForm, UsersEditForm, UsersList } from './users';
import {
  UserGroupsNewForm,
  UserGroupsEditForm,
  UserGroupsList,
} from './user-groups';
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
import { PortalsNewForm, PortalsEditForm, PortalsList } from './portals';

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

    <Route path={paths.usersNewFormPath} component={UsersNewForm} />
    <Route path={paths.usersEditFormPath} component={UsersEditForm} />
    <Route path={paths.usersPath} component={UsersList} />

    <Route path={paths.userGroupsNewFormPath} component={UserGroupsNewForm} />
    <Route path={paths.userGroupsEditFormPath} component={UserGroupsEditForm} />
    <Route path={paths.userGroupsPath} component={UserGroupsList} />

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

    <Route path={paths.portalsNewFormPath} component={PortalsNewForm} />
    <Route path={paths.portalsEditFormPath} component={PortalsEditForm} />
    <Route path={paths.portalsPath} component={PortalsList} />
  </Switch>
);

export default AdminRouter;
