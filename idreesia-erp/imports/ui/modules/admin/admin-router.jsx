import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { AccountsNewForm, AccountsEditForm, AccountsList } from './security-accounts';
import {
  PhysicalStoresNewForm,
  PhysicalStoresEditForm,
  PhysicalStoresList,
} from './physical-stores';
import {
  FinancialAccountsNewForm,
  FinancialAccountsEditForm,
  FinancialAccountsList,
} from './financial-accounts';

const AdminRouter = () => (
  <Switch>
    <Route path={paths.accountsNewFormPath} component={AccountsNewForm} />
    <Route path={paths.accountsEditFormPath} component={AccountsEditForm} />
    <Route path={paths.accountsPath} component={AccountsList} />

    <Route path={paths.physicalStoresNewFormPath} component={PhysicalStoresNewForm} />
    <Route path={paths.physicalStoresEditFormPath} component={PhysicalStoresEditForm} />
    <Route path={paths.physicalStoresPath} component={PhysicalStoresList} />

    <Route path={paths.financialAccountsNewFormPath} component={FinancialAccountsNewForm} />
    <Route path={paths.financialAccountsEditFormPath} component={FinancialAccountsEditForm} />
    <Route path={paths.financialAccountsPath} component={FinancialAccountsList} />
  </Switch>
);

export default AdminRouter;
