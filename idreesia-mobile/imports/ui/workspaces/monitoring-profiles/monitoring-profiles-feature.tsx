import React from 'react';

import { KeepAlive } from '../../layout';
import { matchPath, Redirect, Route, Switch, useLocation, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { MonitoringProfileScreen } from './monitoring-profile-screen';
import { MonitoringProfilesScreen } from './monitoring-profiles-screen';

/**
 * Workspace → Monitoring Profiles. Owns every route under the profiles
 * path. The list stays mounted (KeepAlive) under an opened profile, so back
 * returns to the same search and scroll position.
 */
export const MonitoringProfilesFeature = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { pathname } = useLocation();
  const onList = Boolean(
    matchPath(pathname, { path: WorkspacesPaths.committeeMonitoringProfilesPattern, exact: true }),
  );

  return (
    <>
      <KeepAlive active={onList}>
        <MonitoringProfilesScreen />
      </KeepAlive>
      <Switch>
        <Route exact path={WorkspacesPaths.committeeMonitoringProfilesPattern} render={() => null} />
        <Route
          exact
          component={MonitoringProfileScreen}
          path={WorkspacesPaths.committeeMonitoringProfilePattern}
        />
        <Redirect to={WorkspacesPaths.committeeMonitoringProfiles(committeeId)} />
      </Switch>
    </>
  );
};
