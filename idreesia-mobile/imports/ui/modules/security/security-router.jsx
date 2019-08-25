import React from "react";
import { Switch, Route } from "react-router-dom";

import { default as paths } from "./submodule-paths";
import {
  VisitorRegistrationList,
  VisitorRegistrationNewForm,
} from "./visitor-registeration";

const SecurityRouter = () => (
  <Switch>
    <Route
      path={paths.visitorRegistrationListPath}
      component={VisitorRegistrationList}
    />
    <Route
      path={paths.visitorRegistrationNewFormPath}
      component={VisitorRegistrationNewForm}
    />
  </Switch>
);

export default SecurityRouter;
