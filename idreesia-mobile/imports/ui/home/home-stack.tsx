import React from 'react';

import { KeepAlive } from '../layout';
import { matchPath, Redirect, Route, Switch, useLocation } from '../router';
import {
  DiscussionFeature,
  MeetingsFeature,
  MembersScreen,
  NightStayReportFeature,
  MonitoringAlertsScreen,
  MonitoringProfilesFeature,
  PollsFeature,
  WorkspacesPaths,
} from '../workspaces';
import { HomeScreen } from './home-screen';
import { HomePaths } from './paths';

/**
 * The Home tab and the workspace screens opened from it. Home stays mounted
 * under them (KeepAlive), so going back shows it as it was, with the same
 * workspace still expanded.
 */
export const HomeStack = () => {
  const { pathname } = useLocation();
  const onHome = Boolean(matchPath(pathname, { path: HomePaths.home, exact: true }));

  return (
    <>
      <KeepAlive active={onHome}>
        <HomeScreen />
      </KeepAlive>
      <Switch>
        <Route exact path={HomePaths.home} render={() => null} />
        <Route exact component={MembersScreen} path={WorkspacesPaths.committeeMembersPattern} />
        <Route component={DiscussionFeature} path={WorkspacesPaths.committeeDiscussionsPattern} />
        <Route component={MeetingsFeature} path={WorkspacesPaths.committeeMeetingsPattern} />
        <Route component={PollsFeature} path={WorkspacesPaths.committeePollsPattern} />
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
        <Redirect to={HomePaths.home} />
      </Switch>
    </>
  );
};
