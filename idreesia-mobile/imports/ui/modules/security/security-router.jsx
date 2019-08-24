import React from "react";
import { Switch, Route } from "react-router-dom";

import { default as paths } from "./submodule-paths";
import {
  VisitorRegistrationList,
} from "./visitor-registeration";

const SecurityRouter = () => (
  <Switch>
    <Route
      path={paths.visitorRegistrationListPath}
      component={VisitorRegistrationList}
    />
  </Switch>
);

export default SecurityRouter;
