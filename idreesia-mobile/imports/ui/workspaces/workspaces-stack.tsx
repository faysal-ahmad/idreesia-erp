import React from 'react';

import { KeepAlive } from '../layout';
import { matchPath, Redirect, Route, Switch, useLocation } from '../router';
import { AttendanceScreen } from './duties-attendance/attendance-screen';
import { AttendanceSheetScreen } from './duties-attendance/attendance-sheet-screen';
import { DutiesFeature } from './duties-attendance/duties-feature';
import { PlanningScreen } from './duties-attendance/planning-screen';
import { DiscussionFeature } from './discussions/discussion-feature';
import { DocumentsFeature } from './documents/documents-feature';
import { MehfilDetailsScreen } from './mehfil-details/mehfil-details-screen';
import { MehfilPermissionsScreen } from './mehfil-permissions/mehfil-permissions-screen';
import { MeetingsFeature } from './meetings/meetings-feature';
import { MembersFeature } from './members/members-feature';
import { MonitoringAlertsScreen } from './monitoring-alerts/monitoring-alerts-screen';
import { MonitoringProfilesFeature } from './monitoring-profiles/monitoring-profiles-feature';
import { NightStayReportFeature } from './night-stay-report/night-stay-report-feature';
import { WorkspacesPaths } from './paths';
import { PollsFeature } from './polls/polls-feature';
import { ProjectsFeature } from './projects/projects-feature';
import { WorkspacesScreen } from './workspaces-screen';

/**
 * The Workspaces tab and the workspace screens opened from it. The list stays mounted
 * under them (KeepAlive), so going back shows it as it was, with the same
 * workspace still expanded.
 */
export const WorkspacesStack = () => {
  const { pathname } = useLocation();
  const onWorkspaces = Boolean(matchPath(pathname, { path: WorkspacesPaths.root, exact: true }));

  return (
    <>
      <KeepAlive active={onWorkspaces}>
        <WorkspacesScreen />
      </KeepAlive>
      <Switch>
        <Route exact path={WorkspacesPaths.root} render={() => null} />
        <Route component={MembersFeature} path={WorkspacesPaths.committeeMembersPattern} />
        <Route component={DiscussionFeature} path={WorkspacesPaths.committeeDiscussionsPattern} />
        <Route component={MeetingsFeature} path={WorkspacesPaths.committeeMeetingsPattern} />
        <Route component={PollsFeature} path={WorkspacesPaths.committeePollsPattern} />
        <Route component={ProjectsFeature} path={WorkspacesPaths.committeeProjectsPattern} />
        <Route component={DocumentsFeature} path={WorkspacesPaths.committeeDocumentsPattern} />
        <Route
          component={NightStayReportFeature}
          path={WorkspacesPaths.committeeNightStayReportPattern}
        />
        <Route
          exact
          component={MonitoringAlertsScreen}
          path={WorkspacesPaths.committeeMonitoringAlertsPattern}
        />
        <Route
          component={MonitoringProfilesFeature}
          path={WorkspacesPaths.committeeMonitoringProfilesPattern}
        />
        <Route exact component={MehfilDetailsScreen} path={WorkspacesPaths.mehfilDetailsPattern} />
        <Route exact component={MehfilPermissionsScreen} path={WorkspacesPaths.mehfilPermissionsPattern} />
        <Route component={DutiesFeature} path={WorkspacesPaths.dutiesPattern} />
        <Route exact component={PlanningScreen} path={WorkspacesPaths.dutyPlanningPattern} />
        <Route exact component={AttendanceScreen} path={WorkspacesPaths.dutyAttendancePattern} />
        <Route exact component={AttendanceSheetScreen} path={WorkspacesPaths.attendanceSheetPattern} />
        <Redirect to={WorkspacesPaths.root} />
      </Switch>
    </>
  );
};
