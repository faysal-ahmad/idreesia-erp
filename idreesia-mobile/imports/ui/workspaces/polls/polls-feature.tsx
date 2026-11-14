import React from 'react';

import { KeepAlive } from '../../layout';
import { matchPath, Redirect, Route, Switch, useLocation, useParams } from '../../router';
import { type PollPart, WorkspacesPaths } from '../paths';
import { ActivityScreen } from './activity-screen';
import { PollFormScreen } from './poll-form-screen';
import { PollNotificationsScreen } from './poll-notifications-screen';
import { PollScreen } from './poll-screen';
import { PollsScreen } from './polls-screen';
import { ResultsScreen } from './results-screen';

const PART_SCREENS: Array<[PollPart, React.ComponentType]> = [
  ['edit', PollFormScreen],
  ['results', ResultsScreen],
  ['activity', ActivityScreen],
];

/**
 * Workspace → Polls. Owns every route under the polls path. The list stays
 * mounted (KeepAlive) under an opened poll, and the poll under the screens
 * for its parts, so back returns to each as it was.
 */
export const PollsFeature = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { pathname } = useLocation();
  const onList = Boolean(
    matchPath(pathname, { path: WorkspacesPaths.committeePollsPattern, exact: true }),
  );
  const onNew = Boolean(
    matchPath(pathname, { path: WorkspacesPaths.committeeNewPollPattern, exact: true }),
  );
  const onNotifications = Boolean(
    matchPath(pathname, { path: WorkspacesPaths.committeePollNotificationsPattern, exact: true }),
  );
  const pollMatch = onNew || onNotifications
    ? null
    : matchPath<{ pollId: string }>(pathname, { path: WorkspacesPaths.committeePollPattern });

  return (
    <>
      <KeepAlive active={onList}>
        <PollsScreen />
      </KeepAlive>
      {pollMatch && (
        <KeepAlive key={pollMatch.params.pollId} active={pollMatch.isExact}>
          <PollScreen pollId={pollMatch.params.pollId} />
        </KeepAlive>
      )}
      <Switch>
        <Route exact path={WorkspacesPaths.committeePollsPattern} render={() => null} />
        <Route exact component={PollFormScreen} path={WorkspacesPaths.committeeNewPollPattern} />
        <Route
          exact
          component={PollNotificationsScreen}
          path={WorkspacesPaths.committeePollNotificationsPattern}
        />
        <Route exact path={WorkspacesPaths.committeePollPattern} render={() => null} />
        {PART_SCREENS.map(([part, component]) => (
          <Route
            key={part}
            exact
            component={component}
            path={WorkspacesPaths.committeePollPartPattern(part)}
          />
        ))}
        <Redirect to={WorkspacesPaths.committeePolls(committeeId)} />
      </Switch>
    </>
  );
};
