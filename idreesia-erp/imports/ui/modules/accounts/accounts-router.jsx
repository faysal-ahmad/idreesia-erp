import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { TransactionsNewForm, TransactionsEditForm, TransactionsList } from './transactions';

const AccountsRouter = () => (
  <Switch>
    <Route path={paths.transactionsNewFormPath(':accountId')} component={TransactionsNewForm} />
    <Route path={paths.transactionsEditFormPath(':accountId')} component={TransactionsEditForm} />
    <Route path={paths.transactionsPath(':accountId')} component={TransactionsList} />
  </Switch>
);

export default AccountsRouter;
