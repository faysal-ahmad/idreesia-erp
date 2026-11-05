import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { ModulePaths } from 'meteor/idreesia-common/constants';
import Landing from './landing';

const Router = () => (
  <Switch>
    <Route path={ModulePaths.workspaces} component={Landing} />
  </Switch>
);

export default Router;
