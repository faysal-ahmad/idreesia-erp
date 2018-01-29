import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { ModulePaths } from '/imports/ui/constants';
import { AccountsNewForm, AccountsEditForm, AccountsList } from './accounts';
import { ProfilesNewForm, ProfilesEditForm, ProfilesList } from './profiles';
import { DepartmentsNewForm, DepartmentsEditForm, DepartmentsList } from './departments';

class AdminRouter extends Component {
  render() {
    return (
      <Switch>
        <Route path={paths.accountsNewFormPath} component={AccountsNewForm} />
        <Route path={paths.accountsEditFormPath} component={AccountsEditForm} />
        <Route path={paths.accountsPath} component={AccountsList} />

        <Route path={paths.profilesNewFormPath} component={ProfilesNewForm} />
        <Route path={paths.profilesEditFormPath} component={ProfilesEditForm} />
        <Route path={paths.profilesPath} component={ProfilesList} />

        <Route path={paths.departmentsNewFormPath} component={DepartmentsNewForm} />
        <Route path={paths.departmentsEditFormPath} component={DepartmentsEditForm} />
        <Route path={paths.departmentsPath} component={DepartmentsList} />
      </Switch>
    );
  }
}

export default AdminRouter;
