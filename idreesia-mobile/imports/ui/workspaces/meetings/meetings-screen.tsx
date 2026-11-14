import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Badge, List, Tabs, Tag } from 'antd-mobile';
import { AddOutline, BellOutline, CalendarOutline } from 'antd-mobile-icons';

import { PagedList } from '../../components';
import { usePagedQuery } from '../../hooks';
import { Page } from '../../layout';
import { useHistory, useParams } from '../../router';
import { MOBILE_MY_NOTIFICATION_COUNTS } from '../gql';
import { WorkspacesPaths } from '../paths';
import { formatMeetingTime, meetingStatus, RSVP_COLORS, RSVP_LABELS } from './format';
import { MOBILE_WORKSPACE_MEETINGS } from './gql';
import { useMeetingsInfo } from './use-meeting';

type View = 'upcoming' | 'past' | 'cancelled';

const EMPTY_TITLES: Record<View, string> = {
  upcoming: 'No upcoming meetings',
  past: 'No past meetings',
  cancelled: 'No cancelled meetings',
};

/** Workspace → Meetings: upcoming, past and cancelled meetings. */
export const MeetingsScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const [view, setView] = useState<View>('upcoming');
  const { canManage } = useMeetingsInfo(committeeId);
  // Unread meeting notifications, for the bell. Best effort. cache-and-network
  // so the count updates after reading them (this list stays mounted).
  const { data: countData } = useQuery(MOBILE_MY_NOTIFICATION_COUNTS, {
    fetchPolicy: 'cache-and-network',
  });
  const unreadCount = (countData?.myNotificationCounts ?? [])
    .filter(row => row?.committeeId === committeeId && row.module === 'meetings')
    .reduce((total, row) => total + (row?.unreadCount ?? 0), 0);

  const paged = usePagedQuery(MOBILE_WORKSPACE_MEETINGS, {
    filter: { committeeId, view },
    toVariables: (filter, { pageIndex, pageSize }) => ({
      ...filter,
      pageIndex: Number(pageIndex),
      pageSize: Number(pageSize),
    }),
    getPage: data => data.workspaceMeetings,
    getKey: meeting => meeting._id,
  });

  return (
    <Page
      backTo={WorkspacesPaths.root}
      title="Meetings"
      right={
        <div className="page-nav-actions">
          <Badge content={unreadCount > 0 ? unreadCount : null}>
            <BellOutline
              aria-label="Notifications"
              className="page-nav-action"
              onClick={() => history.push(WorkspacesPaths.committeeMeetingNotifications(committeeId))}
            />
          </Badge>
          {canManage && (
            <AddOutline
              aria-label="New meeting"
              className="page-nav-action"
              onClick={() => history.push(WorkspacesPaths.committeeNewMeeting(committeeId))}
            />
          )}
        </div>
      }
    >
      <Tabs activeKey={view} className="meetings-tabs" onChange={key => setView(key as View)}>
        <Tabs.Tab key="upcoming" title="Upcoming" />
        <Tabs.Tab key="past" title="Past" />
        <Tabs.Tab key="cancelled" title="Cancelled" />
      </Tabs>

      <PagedList
        emptyTitle={EMPTY_TITLES[view]}
        getKey={meeting => meeting._id ?? ''}
        itemsLabel="meetings"
        paged={paged}
        emptyDescription={
          view === 'upcoming' && canManage ? 'Tap + to schedule a meeting.' : undefined
        }
        renderItem={meeting => {
          const status = meetingStatus(meeting.status, meeting.startsAt, meeting.endsAt);
          return (
            <List.Item
              description={
                <>
                  <div>{formatMeetingTime(meeting.startsAt, meeting.endsAt)}</div>
                  {meeting.location && <div>{meeting.location}</div>}
                </>
              }
              extra={
                <div className="meetings-list-tags">
                  <Tag color={status.color} fill="outline">
                    {status.label}
                  </Tag>
                  {meeting.myRsvpStatus && meeting.status === 'scheduled' && (
                    <Tag color={RSVP_COLORS[meeting.myRsvpStatus]} fill="outline">
                      {RSVP_LABELS[meeting.myRsvpStatus]}
                    </Tag>
                  )}
                </div>
              }
              prefix={
                <span className="list-icon">
                  <CalendarOutline />
                </span>
              }
              onClick={() =>
                meeting._id && history.push(WorkspacesPaths.committeeMeeting(committeeId, meeting._id))
              }
            >
              {meeting.title}
            </List.Item>
          );
        }}
      />
    </Page>
  );
};
