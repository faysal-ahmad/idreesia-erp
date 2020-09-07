import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import {
  MembersNewForm,
  MembersUploadForm,
  MembersEditForm,
  MembersList,
} from './members';
import { KarkunsEditForm, KarkunsUploadForm, KarkunsList } from './karkuns';
import { AttendanceSheetsList } from './attendance-sheets';
import { CitiesNewForm, CitiesEditForm, CitiesList } from './cities';
import {
  MehfilDutiesNewForm,
  MehfilDutiesEditForm,
  MehfilDutiesList,
} from './mehfil-duties';
import { PortalsNewForm, PortalsEditForm, PortalsList } from './portals';
import { MessagesList, MessagesNewForm, MessagesEditForm } from './messages';
import { AuditLogsList } from './audit-logs';

const Router = () => (
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

    <Route path={paths.portalsNewFormPath} component={PortalsNewForm} />
    <Route path={paths.portalsEditFormPath} component={PortalsEditForm} />
    <Route path={paths.portalsPath} component={PortalsList} />

    <Route path={paths.membersUploadFormPath} component={MembersUploadForm} />
    <Route path={paths.membersNewFormPath} component={MembersNewForm} />
    <Route path={paths.membersEditFormPath()} component={MembersEditForm} />
    <Route path={paths.membersPath} component={MembersList} />

    <Route path={paths.karkunsUploadFormPath} component={KarkunsUploadForm} />
    <Route path={paths.karkunsEditFormPath()} component={KarkunsEditForm} />
    <Route path={paths.karkunsPath} component={KarkunsList} />

    <Route path={paths.attendanceSheetsPath} component={AttendanceSheetsList} />

    <Route path={paths.auditLogsPath} component={AuditLogsList} />

    <Route path={paths.messagesNewFormPath} component={MessagesNewForm} />
    <Route path={paths.messagesEditFormPath()} component={MessagesEditForm} />
    <Route path={paths.messagesPath} component={MessagesList} />
  </Switch>
);

export default Router;
