import React from "react";
import { Switch, Route } from "react-router-dom";

import { default as paths } from "./submodule-paths";
import { KarkunVerificationForm } from "./karkun-verification";
import {
  VisitorRegistrationScanForm,
  VisitorRegistrationNewForm,
  VisitorRegistrationEditForm,
  VisitorRegistrationList,
} from "./visitor-registeration";
import { VisitorCardVerificationForm } from "./visitor-card-verification";
import { VisitorStayReport } from "./visitor-stay-report";

const SecurityRouter = () => (
  <Switch>
    <Route
      path={paths.karkunCardVerificationPath}
      component={KarkunVerificationForm}
    />

    <Route
      path={paths.visitorRegistrationListPath}
      component={VisitorRegistrationList}
    />
    <Route
      path={paths.visitorRegistrationNewFormPath}
      component={VisitorRegistrationNewForm}
    />
    <Route
      path={paths.visitorRegistrationEditFormPath()}
      component={VisitorRegistrationEditForm}
    />
    <Route
      path={paths.visitorRegistrationPath}
      component={VisitorRegistrationScanForm}
    />

    <Route
      path={paths.visitorCardVerificationPath}
      component={VisitorCardVerificationForm}
    />

    <Route path={paths.visitorStayReportPath} component={VisitorStayReport} />
  </Switch>
);

export default SecurityRouter;
