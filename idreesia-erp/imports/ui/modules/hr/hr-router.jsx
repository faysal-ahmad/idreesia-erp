import React from "react";
import { Switch, Route } from "react-router-dom";

import { default as paths } from "./submodule-paths";
import { DutiesNewForm, DutiesEditForm, DutiesList } from "./duties";
import {
  DutyLocationsNewForm,
  DutyLocationsEditForm,
  DutyLocationsList,
} from "./duty-locations";
import { KarkunsNewForm, KarkunsEditForm, KarkunsList } from "./karkuns";

const HRRouter = () => (
    <Switch>
      <Route path={paths.dutiesNewFormPath} component={DutiesNewForm} />
      <Route path={paths.dutiesEditFormPath} component={DutiesEditForm} />
      <Route path={paths.dutiesPath} component={DutiesList} />

      <Route
        path={paths.dutyLocationsNewFormPath}
        component={DutyLocationsNewForm}
      />
      <Route
        path={paths.dutyLocationsEditFormPath}
        component={DutyLocationsEditForm}
      />
      <Route path={paths.dutyLocationsPath} component={DutyLocationsList} />

      <Route path={paths.karkunsNewFormPath} component={KarkunsNewForm} />
      <Route path={paths.karkunsEditFormPath} component={KarkunsEditForm} />
      <Route path={paths.karkunsPath} component={KarkunsList} />
    </Switch>
  );

export default HRRouter;
