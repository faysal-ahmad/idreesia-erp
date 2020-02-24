import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { KarkunsEditForm, KarkunsList } from './karkuns';
import { MembersNewForm, MembersEditForm, MembersList } from './members';
import { AttendanceSheetsList } from './attendance-sheets';
import {
  AmaanatLogsList,
  AmaanatLogsNewForm,
  AmaanatLogsEditForm,
} from './amaanat-logs';

const Router = () => (
  <Switch>
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

    <Route path={paths.membersNewFormPath()} component={MembersNewForm} />
    <Route path={paths.membersEditFormPath()} component={MembersEditForm} />
    <Route path={paths.membersPath()} component={MembersList} />
  </Switch>
);

export default Router;
