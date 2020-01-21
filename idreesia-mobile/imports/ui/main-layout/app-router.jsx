import React from 'react';
import { Switch, Route } from 'react-router-dom';

import LoginForm from './login-form';
import BlankPage from './blank-page';

import { default as securityPaths } from '/imports/ui/modules/security/submodule-paths';
import { MehfilCardVerificationForm } from '/imports/ui/modules/security/mehfil-card-verification';
import {
  VisitorRegistrationSearchForm,
  VisitorRegistrationNewForm,
} from '/imports/ui/modules/security/visitor-registeration';

const AppRouter = () => (
  <Switch>
    <Route exact path="/login" component={LoginForm} />
    <Route
      exact
      path={securityPaths.mehfilCardVerificationPath}
      component={MehfilCardVerificationForm}
    />

    <Route
      exact
      path={securityPaths.visitorRegistrationSearchPath}
      component={VisitorRegistrationSearchForm}
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
