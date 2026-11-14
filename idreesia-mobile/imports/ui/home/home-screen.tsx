import React from 'react';
import { List, PullToRefresh, Tag } from 'antd-mobile';

import { CollapsibleSection } from '../components/collapsible-section';
import { PageError, PageLoading, Page } from '../layout';
import { useHistory } from '../router';
import { formatMeetingTime } from '../workspaces/meetings/format';
import { WorkspacesPaths } from '../workspaces/paths';
import { describeClosing } from '../workspaces/polls/format';
import { useHomeItems } from './use-home-items';

/** One line: the title, then the workspace in small text; each truncates with "…". */
const ItemTitle = ({ workspace, title }: { workspace?: string | null; title?: string | null }) => (
  <div className="home-item-title">
    <span className="home-item-name">{title}</span>
    {workspace && <span className="home-item-workspace">({workspace})</span>}
  </div>
);

/** Whether the user has voted; nothing for polls they can't vote in. */
const pollVoteTag = (poll: { hasVoted?: boolean | null; isEligible?: boolean | null }) => {
  if (poll.hasVoted) {
    return (
      <Tag color="success" fill="outline">
        Voted
      </Tag>
    );
  }
  if (poll.isEligible) {
    return (
      <Tag color="warning" fill="outline">
        Not voted
      </Tag>
    );
  }
  return undefined;
};

/** Home tab, the default screen after signing in. */
export const HomeScreen = () => {
  const history = useHistory();
  const { loading, error, meetings, polls, actionItems, refresh } = useHomeItems();

  let content;
  if (loading) {
    content = <PageLoading />;
  } else if (error) {
    content = <PageError error={error} onRetry={refresh} />;
  } else {
    content = (
      <PullToRefresh onRefresh={refresh}>
        <CollapsibleSection count={meetings.length} title="Upcoming Meetings">
          {meetings.length === 0 ? (
            <List.Item className="workspaces-empty-item">No upcoming meetings</List.Item>
          ) : (
            meetings.map(meeting => (
              <List.Item
                key={meeting._id}
                className="home-item"
                description={formatMeetingTime(meeting.startsAt, meeting.endsAt)}
                onClick={() =>
                  history.push(WorkspacesPaths.committeeMeeting(meeting.committeeId, meeting._id))
                }
              >
                <ItemTitle title={meeting.title} workspace={meeting.committeeName} />
              </List.Item>
            ))
          )}
        </CollapsibleSection>

        <CollapsibleSection count={actionItems.length} title="Pending Action Items">
          {actionItems.length === 0 ? (
            <List.Item className="workspaces-empty-item">No pending action items</List.Item>
          ) : (
            actionItems.map(item => (
              <List.Item
                key={item._id}
                className="home-item"
                onClick={() =>
                  history.push(WorkspacesPaths.committeeMeeting(item.committeeId, item.meetingId))
                }
              >
                <ItemTitle title={item.title} workspace={item.meetingTitle} />
              </List.Item>
            ))
          )}
        </CollapsibleSection>

        <CollapsibleSection count={polls.length} title="Active Polls">
          {polls.length === 0 ? (
            <List.Item className="workspaces-empty-item">No active polls</List.Item>
          ) : (
            polls.map(poll => (
              <List.Item
                key={poll._id}
                className="home-item"
                description={describeClosing(poll)}
                extra={pollVoteTag(poll)}
                onClick={() =>
                  history.push(WorkspacesPaths.committeePoll(poll.committeeId, poll._id))
                }
              >
                <ItemTitle title={poll.title} workspace={poll.committeeName} />
              </List.Item>
            ))
          )}
        </CollapsibleSection>
      </PullToRefresh>
    );
  }

  return <Page title="Home">{content}</Page>;
};
