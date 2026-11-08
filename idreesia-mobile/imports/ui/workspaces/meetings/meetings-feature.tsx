import React from 'react';

import { KeepAlive } from '../../layout';
import { matchPath, Redirect, Route, Switch, useLocation, useParams } from '../../router';
import { type MeetingPart, WorkspacesPaths } from '../paths';
import { ActionItemsScreen } from './action-items-screen';
import { ActivityScreen } from './activity-screen';
import { AgendaScreen } from './agenda-screen';
import { AttachmentsScreen } from './attachments-screen';
import { MeetingFormScreen } from './meeting-form-screen';
import { MeetingScreen } from './meeting-screen';
import { MeetingsScreen } from './meetings-screen';
import { MinutesScreen } from './minutes-screen';
import { ParticipantsScreen } from './participants-screen';

const PART_SCREENS: Array<[MeetingPart, React.ComponentType]> = [
  ['edit', MeetingFormScreen],
  ['agenda', AgendaScreen],
  ['participants', ParticipantsScreen],
  ['minutes', MinutesScreen],
  ['attachments', AttachmentsScreen],
  ['action-items', ActionItemsScreen],
  ['activity', ActivityScreen],
];

/**
 * Workspace → Meetings. Owns every route under the meetings path. The list
 * stays mounted (KeepAlive) under an opened meeting, and the meeting under
 * the screens for its parts, so back returns to each as it was.
 */
export const MeetingsFeature = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { pathname } = useLocation();
  const onList = Boolean(
    matchPath(pathname, { path: WorkspacesPaths.committeeMeetingsPattern, exact: true }),
  );
  const onNew = Boolean(
    matchPath(pathname, { path: WorkspacesPaths.committeeNewMeetingPattern, exact: true }),
  );
  const meetingMatch = onNew
    ? null
    : matchPath<{ meetingId: string }>(pathname, { path: WorkspacesPaths.committeeMeetingPattern });

  return (
    <>
      <KeepAlive active={onList}>
        <MeetingsScreen />
      </KeepAlive>
      {meetingMatch && (
        <KeepAlive key={meetingMatch.params.meetingId} active={meetingMatch.isExact}>
          <MeetingScreen meetingId={meetingMatch.params.meetingId} />
        </KeepAlive>
      )}
      <Switch>
        <Route exact path={WorkspacesPaths.committeeMeetingsPattern} render={() => null} />
        <Route exact component={MeetingFormScreen} path={WorkspacesPaths.committeeNewMeetingPattern} />
        <Route exact path={WorkspacesPaths.committeeMeetingPattern} render={() => null} />
        {PART_SCREENS.map(([part, component]) => (
          <Route
            key={part}
            exact
            component={component}
            path={WorkspacesPaths.committeeMeetingPartPattern(part)}
          />
        ))}
        <Redirect to={WorkspacesPaths.committeeMeetings(committeeId)} />
      </Switch>
    </>
  );
};
