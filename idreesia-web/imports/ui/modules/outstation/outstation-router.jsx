import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { KarkunsNewForm, KarkunsEditForm, KarkunsList } from './karkuns';
import { AttendanceSheetsList } from './attendance-sheets';
import { CitiesNewForm, CitiesEditForm, CitiesList } from './cities';
import {
  MehfilDutiesNewForm,
  MehfilDutiesEditForm,
  MehfilDutiesList,
} from './mehfil-duties';

const OutstationRouter = () => (
  <Switch>
    <Route path={paths.citiesNewFormPath} component={CitiesNewForm} />
    <Route path={paths.citiesEditFormPath()} component={CitiesEditForm} />
    <Route path={paths.citiesPath} component={CitiesList} />

    <Route
      path={paths.mehfilDutiesNewFormPath}
      component={MehfilDutiesNewForm}
    />
    <Route
      path={paths.mehfilDutiesEditFormPath()}
      component={MehfilDutiesEditForm}
    />
    <Route path={paths.mehfilDutiesPath} component={MehfilDutiesList} />

    <Route path={paths.karkunsNewFormPath} component={KarkunsNewForm} />
    <Route path={paths.karkunsEditFormPath()} component={KarkunsEditForm} />
    <Route path={paths.karkunsPath} component={KarkunsList} />

    <Route path={paths.attendanceSheetsPath} component={AttendanceSheetsList} />
  </Switch>
);

export default OutstationRouter;
