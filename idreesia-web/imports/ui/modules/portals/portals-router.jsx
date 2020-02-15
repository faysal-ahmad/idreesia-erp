import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { KarkunsNewForm, KarkunsEditForm, KarkunsList } from './karkuns';
import { VisitorsNewForm, VisitorsEditForm, VisitorsList } from './visitors';
import { AttendanceSheetsList } from './attendance-sheets';
import {
  AmaanatLogsList,
  AmaanatLogsNewForm,
  AmaanatLogsEditForm,
} from './amaanat-logs';

const PortalsRouter = () => (
  <Switch>
    <Route path={paths.karkunsNewFormPath()} component={KarkunsNewForm} />
    <Route path={paths.karkunsEditFormPath()} component={KarkunsEditForm} />
    <Route path={paths.karkunsPath()} component={KarkunsList} />

    <Route
      path={paths.attendanceSheetsPath()}
      component={AttendanceSheetsList}
    />

    <Route
      path={paths.amaanatLogsNewFormPath()}
      component={AmaanatLogsNewForm}
    />
    <Route
      path={paths.amaanatLogsEditFormPath()}
      component={AmaanatLogsEditForm}
    />
    <Route path={paths.amaanatLogsPath()} component={AmaanatLogsList} />

    <Route path={paths.visitorsNewFormPath()} component={VisitorsNewForm} />
    <Route path={paths.visitorsEditFormPath()} component={VisitorsEditForm} />
    <Route path={paths.visitorsPath()} component={VisitorsList} />
  </Switch>
);

export default PortalsRouter;
