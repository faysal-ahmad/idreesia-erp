import React from 'react';

import { KeepAlive } from '../../../layout';
import { matchPath, Redirect, Route, Switch, useLocation } from '../../../router';
import { SecurityPaths } from '../paths';
import { VisitorDetailScreen } from '../visitors';
import { StayReportScreen } from './stay-report-screen';

/**
 * Security → Stay report. Owns every route under SecurityPaths.stayReport.
 * A visitor opened from the report is shown under the report's own path, with
 * the report kept mounted (KeepAlive), so back returns to the same date.
 */
export const StayReportFeature = () => {
  const { pathname } = useLocation();
  const onReport = Boolean(matchPath(pathname, { path: SecurityPaths.stayReport, exact: true }));

  return (
    <>
      <KeepAlive active={onReport}>
        <StayReportScreen />
      </KeepAlive>
      <Switch>
        <Route exact path={SecurityPaths.stayReport} render={() => null} />
        <Route
          exact
          path={SecurityPaths.stayReportVisitorPattern}
          render={() => <VisitorDetailScreen backTo={SecurityPaths.stayReport} />}
        />
        <Redirect to={SecurityPaths.stayReport} />
      </Switch>
    </>
  );
};
