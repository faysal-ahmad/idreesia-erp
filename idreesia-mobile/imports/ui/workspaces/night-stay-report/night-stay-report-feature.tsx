import React from 'react';

import { KeepAlive } from '../../layout';
import { matchPath, Redirect, Route, Switch, useLocation, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { NightStayDetailScreen } from './night-stay-detail-screen';
import { NightStayReportScreen } from './night-stay-report-screen';

/**
 * Workspace → Night Stay Report. Owns every route under the report's path.
 * The report stays mounted (KeepAlive) under an opened stay, so back returns
 * to the same night and scroll position.
 */
export const NightStayReportFeature = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { pathname } = useLocation();
  const onReport = Boolean(
    matchPath(pathname, { path: WorkspacesPaths.committeeNightStayReportPattern, exact: true }),
  );

  return (
    <>
      <KeepAlive active={onReport}>
        <NightStayReportScreen />
      </KeepAlive>
      <Switch>
        <Route exact path={WorkspacesPaths.committeeNightStayReportPattern} render={() => null} />
        <Route exact component={NightStayDetailScreen} path={WorkspacesPaths.committeeNightStayPattern} />
        <Redirect to={WorkspacesPaths.committeeNightStayReport(committeeId)} />
      </Switch>
    </>
  );
};
