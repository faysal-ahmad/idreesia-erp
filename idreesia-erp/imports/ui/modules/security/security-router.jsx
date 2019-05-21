import React from "react";
import { Switch, Route } from "react-router-dom";

import { default as paths } from "./submodule-paths";
import { KarkunVerificationForm } from "./karkun-verification";

const SecurityRouter = () => (
  <Switch>
    <Route
      path={paths.karkunVerificationPath}
      component={KarkunVerificationForm}
    />
  </Switch>
);

export default SecurityRouter;
