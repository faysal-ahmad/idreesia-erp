import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { UsersNewForm, UsersEditForm, UsersList } from './users';
import {
  UserGroupsNewForm,
  UserGroupsEditForm,
  UserGroupsList,
} from './user-groups';
import { SecurityLogsList } from './security-logs';
import {
  PhysicalStoresNewForm,
  PhysicalStoresEditForm,
  PhysicalStoresList,
} from './physical-stores';
import { CitiesNewForm, CitiesEditForm, CitiesList } from './cities';
import { JobsList, JobLogsList, JobDefinitionsList } from './jobs';
import { PeopleTagsList } from './people-tags';
import { DeletedPeopleList, DeletedPersonEditForm } from './deleted-people';
import { DuplicatePeopleList, DuplicatePersonEditForm } from './duplicate-people';

const Router = () => (
  <Switch>
    <Route path={paths.usersNewFormPath} component={UsersNewForm} />
    <Route path={paths.usersEditFormPath} component={UsersEditForm} />
    <Route path={paths.usersPath} component={UsersList} />

    <Route path={paths.userGroupsNewFormPath} component={UserGroupsNewForm} />
    <Route path={paths.userGroupsEditFormPath} component={UserGroupsEditForm} />
    <Route path={paths.userGroupsPath} component={UserGroupsList} />

    <Route path={paths.securityLogsPath} component={SecurityLogsList} />

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

    <Route path={paths.jobsPath} component={JobsList} />
    <Route path={paths.jobLogsPath} component={JobLogsList} />
    <Route path={paths.jobDefinitionsPath} component={JobDefinitionsList} />

    <Route path={paths.peopleTagsPath} component={PeopleTagsList} />

    <Route
      path={paths.deletedPersonEditFormPath()}
      component={DeletedPersonEditForm}
    />
    <Route path={paths.deletedPeoplePath} component={DeletedPeopleList} />

    <Route
      path={paths.duplicatePersonEditFormPath()}
      component={DuplicatePersonEditForm}
    />
    <Route path={paths.duplicatePeoplePath} component={DuplicatePeopleList} />
  </Switch>
);

export default Router;
