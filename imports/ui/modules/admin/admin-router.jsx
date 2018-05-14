import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { ModulePaths } from '/imports/ui/constants';
import { AccountsNewForm, AccountsEditForm, AccountsList } from './accounts';

class AdminRouter extends Component {
  render() {
    return (
      <Switch>
        <Route path={paths.accountsNewFormPath} component={AccountsNewForm} />
        <Route path={paths.accountsEditFormPath} component={AccountsEditForm} />
        <Route path={paths.accountsPath} component={AccountsList} />
      </Switch>
    );
  }
}

export default AdminRouter;
