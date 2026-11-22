import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { ModulePaths } from 'meteor/idreesia-common/constants';
import { default as paths } from './submodule-paths';
import { MembersList } from './members';
import { DiscussionsPage } from './discussions';
import { DocumentsPage } from './documents';
import { MeetingPage, MeetingsPage } from './meetings';
import { PollPage, PollsPage } from './polls';
import { ProjectPage, ProjectsPage } from './projects';
import { NightStayReport } from './night-stay-report';
import { MonitoringAlerts } from './monitoring-alerts';
import { MonitoringProfiles } from './monitoring-profiles';
import {
  AttendancePage,
  AttendanceSheetPage,
  DutiesPage,
  PlanningPage,
} from './duties-attendance';
import { MehfilDetailsPage } from './mehfil-details';
import { MehfilKarkunsPage } from './mehfil-karkuns';
import { MehfilPermissionsPage } from './mehfil-permissions';
import Landing from './landing';
import { useWorkspaceBreadcrumbs } from './use-workspace-breadcrumbs';

const Router = () => {
  useWorkspaceBreadcrumbs();
  return (
  <Switch>
    <Route path={paths.committeeMembersPath()} component={MembersList} />
    <Route path={paths.committeeDiscussionsPath()} component={DiscussionsPage} />
    <Route path={paths.committeeDocumentsPath()} component={DocumentsPage} />
    <Route path={paths.committeeMeetingPath()} component={MeetingPage} />
    <Route path={paths.committeeMeetingsPath()} component={MeetingsPage} />
    <Route path={paths.committeePollPath()} component={PollPage} />
    <Route path={paths.committeePollsPath()} component={PollsPage} />
    <Route path={paths.committeeProjectPath()} component={ProjectPage} />
    <Route path={paths.committeeProjectsPath()} component={ProjectsPage} />
    <Route
      path={paths.committeeNightStayReportPath()}
      component={NightStayReport}
    />
    <Route
      path={paths.committeeMonitoringAlertsPath()}
      component={MonitoringAlerts}
    />
    <Route
      path={paths.committeeMonitoringProfilesPath()}
      component={MonitoringProfiles}
    />
    <Route path={paths.locationDutiesPath()} component={DutiesPage} />
    <Route path={paths.locationDutyPlanningPath()} component={PlanningPage} />
    <Route
      path={paths.locationDutyAttendancePath()}
      component={AttendancePage}
    />
    <Route
      path={paths.locationAttendanceSheetPath()}
      component={AttendanceSheetPage}
    />
    <Route
      path={paths.locationMehfilDetailsPath()}
      component={MehfilDetailsPage}
    />
    <Route
      path={paths.locationMehfilKarkunsPath()}
      component={MehfilKarkunsPage}
    />
    <Route
      path={paths.locationMehfilPermissionsPath()}
      component={MehfilPermissionsPage}
    />
    <Route
      path={paths.locationDutiesAttendancePath()}
      render={({ match }) => (
        <Redirect to={paths.locationDutiesPath(match.params.locationId)} />
      )}
    />
    <Route path={ModulePaths.workspaces} component={Landing} />
  </Switch>
  );
};

export default Router;
