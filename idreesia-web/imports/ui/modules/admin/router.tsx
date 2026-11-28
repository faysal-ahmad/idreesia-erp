import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { UsersNewForm, UsersEditForm, UsersList } from './users';
import { ServiceAccountsNewForm, ServiceAccountsList } from './service-accounts';
import {
  UserGroupsNewForm,
  UserGroupsEditForm,
  UserGroupsList,
} from './user-groups';
import { SecurityLogsList } from './security-logs';
import { CitiesNewForm, CitiesEditForm, CitiesList } from './cities';
import { JobsList, JobLogsList, JobDefinitionsList } from './jobs';
import { PeopleTagsList } from './people-tags';
import { FreeFormDataList } from './free-form-data';
import { DeletedPeopleList, DeletedPersonEditForm } from './deleted-people';
import { DuplicatePeopleList, DuplicatePersonEditForm } from './duplicate-people';
import { CommitteesEditForm } from './committees';
import {
  OrgLocationsEditForm,
  OrgLocationsList,
} from './org-locations';
import { MehfilTemplatesList } from './mehfil-templates';
import { FacialRecognitionSettings } from './facial-recognition';

const Router = () => (
  <Switch>
    <Route path={paths.usersNewFormPath} component={UsersNewForm} />
    <Route path={paths.usersEditFormPath} component={UsersEditForm} />
    <Route path={paths.usersPath} component={UsersList} />

    <Route
      path={paths.serviceAccountsNewFormPath}
      component={ServiceAccountsNewForm}
    />
    <Route path={paths.serviceAccountsEditFormPath} component={UsersEditForm} />
    <Route path={paths.serviceAccountsPath} component={ServiceAccountsList} />

    <Route path={paths.userGroupsNewFormPath} component={UserGroupsNewForm} />
    <Route path={paths.userGroupsEditFormPath} component={UserGroupsEditForm} />
    <Route path={paths.userGroupsPath} component={UserGroupsList} />

    <Route path={paths.securityLogsPath} component={SecurityLogsList} />

    <Route path={paths.citiesNewFormPath} component={CitiesNewForm} />
    <Route path={paths.citiesEditFormPath()} component={CitiesEditForm} />
    <Route path={paths.citiesPath} component={CitiesList} />

    <Route path={paths.jobsPath} component={JobsList} />
    <Route path={paths.jobLogsPath} component={JobLogsList} />
    <Route path={paths.jobDefinitionsPath} component={JobDefinitionsList} />

    <Route path={paths.peopleTagsPath} component={PeopleTagsList} />
    <Route path={paths.freeFormDataPath} component={FreeFormDataList} />

    <Route
      path={paths.orgLocationCommitteeEditFormPath()}
      component={CommitteesEditForm}
    />
    <Route
      path={paths.orgLocationsEditFormPath()}
      component={OrgLocationsEditForm}
    />
    <Route path={paths.orgLocationsPath} component={OrgLocationsList} />

    <Route path={paths.mehfilTemplatesPath} component={MehfilTemplatesList} />

    <Route
      path={paths.facialRecognitionPath}
      component={FacialRecognitionSettings}
    />

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
