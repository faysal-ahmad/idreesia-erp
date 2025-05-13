import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import {
  MembersNewForm,
  MembersUploadForm,
  MembersEditForm,
  MembersList,
} from './members';
import {
  KarkunsNewForm,
  KarkunsEditForm,
  KarkunsUploadForm,
  KarkunsList,
} from './karkuns';
import { AttendanceSheetsList } from './attendance-sheets';
import { CitiesNewForm, CitiesEditForm, CitiesList } from './cities';
import {
  MehfilDutiesNewForm,
  MehfilDutiesEditForm,
  MehfilDutiesList,
} from './mehfil-duties';
import {
  PortalUsersList,
  PortalUsersNewForm,
  PortalUsersEditForm,
} from './portal-users';
import { OutstationUsersList } from './outstation-users';
import { PortalsNewForm, PortalsEditForm, PortalsList } from './portals';
import { AuditLogsList } from './audit-logs';
import { SecurityLogsList } from './security-logs';

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
    <Route path={paths.karkunsNewFormPath} component={KarkunsNewForm} />
    <Route path={paths.karkunsEditFormPath()} component={KarkunsEditForm} />
    <Route path={paths.karkunsPath} component={KarkunsList} />

    <Route path={paths.attendanceSheetsPath} component={AttendanceSheetsList} />

    <Route path={paths.auditLogsPath} component={AuditLogsList} />
    <Route path={paths.securityLogsPath} component={SecurityLogsList} />

    <Route path={paths.outstationUsersPath} component={OutstationUsersList} />
    <Route path={paths.portalUsersNewFormPath} component={PortalUsersNewForm} />
    <Route
      path={paths.portalUsersEditFormPath()}
      component={PortalUsersEditForm}
    />
    <Route path={paths.portalUsersPath} component={PortalUsersList} />
  </Switch>
);

export default Router;
