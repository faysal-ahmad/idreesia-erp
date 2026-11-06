import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { ModulePaths } from 'meteor/idreesia-common/constants';
import { default as paths } from './submodule-paths';
import { MembersList } from './members';
import Landing from './landing';

const Router = () => (
  <Switch>
    <Route path={paths.committeeMembersPath()} component={MembersList} />
    <Route path={ModulePaths.workspaces} component={Landing} />
  </Switch>
);

export default Router;
