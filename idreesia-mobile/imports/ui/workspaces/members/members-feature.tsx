import React from 'react';

import { KeepAlive } from '../../layout';
import { matchPath, Redirect, Route, Switch, useLocation, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { MemberNotificationsScreen } from './member-notifications-screen';
import { MembersScreen } from './members-screen';

/**
 * Workspace → Members. Owns every route under the members path. The list
 * stays mounted (KeepAlive) under its notifications.
 */
export const MembersFeature = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { pathname } = useLocation();
  const onList = Boolean(
    matchPath(pathname, { path: WorkspacesPaths.committeeMembersPattern, exact: true }),
  );

  return (
    <>
      <KeepAlive active={onList}>
        <MembersScreen />
      </KeepAlive>
      <Switch>
        <Route exact path={WorkspacesPaths.committeeMembersPattern} render={() => null} />
        <Route
          exact
          component={MemberNotificationsScreen}
          path={WorkspacesPaths.committeeMemberNotificationsPattern}
        />
        <Redirect to={WorkspacesPaths.committeeMembers(committeeId)} />
      </Switch>
    </>
  );
};
