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

const RouterSwitch = Switch as any;
const RouterRoute = Route as any;

const Router = () => (
  <RouterSwitch>
    <RouterRoute path={paths.usersNewFormPath} component={UsersNewForm} />
    <RouterRoute path={paths.usersEditFormPath} component={UsersEditForm} />
    <RouterRoute path={paths.usersPath} component={UsersList} />

    <RouterRoute path={paths.userGroupsNewFormPath} component={UserGroupsNewForm} />
    <RouterRoute path={paths.userGroupsEditFormPath} component={UserGroupsEditForm} />
    <RouterRoute path={paths.userGroupsPath} component={UserGroupsList} />

    <RouterRoute
      path={paths.physicalStoresNewFormPath}
      component={PhysicalStoresNewForm}
    />
    <RouterRoute
      path={paths.physicalStoresEditFormPath}
      component={PhysicalStoresEditForm}
    />
    <RouterRoute path={paths.physicalStoresPath} component={PhysicalStoresList} />

    <RouterRoute path={paths.citiesNewFormPath} component={CitiesNewForm} />
    <RouterRoute path={paths.citiesEditFormPath()} component={CitiesEditForm} />
    <RouterRoute path={paths.citiesPath} component={CitiesList} />
  </RouterSwitch>
);

export default Router;
