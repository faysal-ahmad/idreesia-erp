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
import { UsersList, UsersNewForm, UsersEditForm } from './users';
import { AuditLogsList } from './audit-logs';

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

    <Route path={paths.auditLogsPath()} component={AuditLogsList} />

    <Route path={paths.usersNewFormPath()} component={UsersNewForm} />
    <Route path={paths.usersEditFormPath()} component={UsersEditForm} />
    <Route path={paths.usersPath()} component={UsersList} />
  </Switch>
);

export default Router;
