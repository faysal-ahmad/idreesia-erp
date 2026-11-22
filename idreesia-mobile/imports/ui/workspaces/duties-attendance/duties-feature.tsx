import React from 'react';

import { KeepAlive } from '../../layout';
import { matchPath, Redirect, Route, Switch, useLocation, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { DutiesScreen } from './duties-screen';
import { DutyScreen } from './duty-screen';

/**
 * Workspace → Duties & Attendance → Duties. The list stays mounted
 * (KeepAlive) under an opened duty, so back returns to it as it was.
 */
export const DutiesFeature = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const { pathname } = useLocation();
  const onList = Boolean(matchPath(pathname, { path: WorkspacesPaths.dutiesPattern, exact: true }));

  return (
    <>
      <KeepAlive active={onList}>
        <DutiesScreen />
      </KeepAlive>
      <Switch>
        <Route exact path={WorkspacesPaths.dutiesPattern} render={() => null} />
        <Route exact component={DutyScreen} path={WorkspacesPaths.dutyPattern} />
        <Redirect to={WorkspacesPaths.duties(locationId)} />
      </Switch>
    </>
  );
};
