// @ts-nocheck
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
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
import { CitiesNewForm, CitiesEditForm, CitiesList } from './cities';

const Router = () => (
  <Switch>
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

    <Route path={paths.citiesNewFormPath} component={CitiesNewForm} />
    <Route path={paths.citiesEditFormPath()} component={CitiesEditForm} />
    <Route path={paths.citiesPath} component={CitiesList} />
  </Switch>
);

export default Router;
