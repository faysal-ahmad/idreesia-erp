import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as securityPaths } from '/imports/ui/modules/security/submodule-paths';
import {
  VisitorRegistrationList,
  VisitorRegistrationNewForm,
} from '/imports/ui/modules/security/visitor-registeration';

const AppRouter = () => (
  <Switch>
    <Route
      path={securityPaths.visitorRegistrationListPath}
      component={VisitorRegistrationList}
    />
    <Route
      path={securityPaths.visitorRegistrationNewFormPath}
      component={VisitorRegistrationNewForm}
    />
  </Switch>
);

export default AppRouter;
