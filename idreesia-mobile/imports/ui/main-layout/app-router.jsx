import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as securityPaths } from '/imports/ui/modules/security/submodule-paths';
import {
  VisitorRegistrationList,
  VisitorRegistrationNewForm,
} from '/imports/ui/modules/security/visitor-registeration';

const BlankPage = () => <div />;
const AppRouter = () => (
  <Switch>
    <Route
      exact
      path={securityPaths.visitorRegistrationListPath}
      component={VisitorRegistrationList}
    />
    <Route
      exact
      path={securityPaths.visitorRegistrationNewFormPath}
      component={VisitorRegistrationNewForm}
    />

    <Route component={BlankPage} />
  </Switch>
);

export default AppRouter;
