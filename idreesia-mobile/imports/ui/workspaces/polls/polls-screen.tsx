import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Badge, List, Tabs, Tag } from 'antd-mobile';
import { AddOutline, BellOutline, PieOutline } from 'antd-mobile-icons';

import { PagedList } from '../../components';
import { usePagedQuery } from '../../hooks';
import { Page } from '../../layout';
import { useHistory, useParams } from '../../router';
import { MOBILE_MY_NOTIFICATION_COUNTS } from '../gql';
import { WorkspacesPaths } from '../paths';
import { describeClosing, pollStatus } from './format';
import { MOBILE_WORKSPACE_POLLS } from './gql';
import { usePollsInfo } from './use-poll';

type View = 'open' | 'closed' | 'drafts' | 'all';

const EMPTY_TITLES: Record<View, string> = {
  open: 'No open polls',
  closed: 'No closed polls',
  drafts: 'No draft polls',
  all: 'No polls yet',
};

/** Workspace → Polls: open, closed and (for coordinators) draft polls. */
export const PollsScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const [view, setView] = useState<View>('open');
  const { canManage } = usePollsInfo(committeeId);
  // Unread poll notifications, for the bell. Best effort. cache-and-network
  // so the count updates after reading them (this list stays mounted).
  const { data: countData } = useQuery(MOBILE_MY_NOTIFICATION_COUNTS, {
    fetchPolicy: 'cache-and-network',
  });
  const unreadCount = (countData?.myNotificationCounts ?? [])
    .filter(row => row?.committeeId === committeeId && row.module === 'polls')
    .reduce((total, row) => total + (row?.unreadCount ?? 0), 0);

  const paged = usePagedQuery(MOBILE_WORKSPACE_POLLS, {
    filter: { committeeId, view },
    toVariables: (filter, { pageIndex, pageSize }) => ({
      ...filter,
      pageIndex: Number(pageIndex),
      pageSize: Number(pageSize),
    }),
    getPage: data => data.workspacePolls,
    getKey: poll => poll._id,
  });

  return (
    <Page
      backTo={WorkspacesPaths.root}
      title="Polls"
      right={
        <div className="page-nav-actions">
          <Badge content={unreadCount > 0 ? unreadCount : null}>
            <BellOutline
              aria-label="Notifications"
              className="page-nav-action"
              onClick={() => history.push(WorkspacesPaths.committeePollNotifications(committeeId))}
            />
          </Badge>
          {canManage && (
            <AddOutline
              aria-label="New poll"
              className="page-nav-action"
              onClick={() => history.push(WorkspacesPaths.committeeNewPoll(committeeId))}
            />
          )}
        </div>
      }
    >
      <Tabs activeKey={view} className="polls-tabs" onChange={key => setView(key as View)}>
        <Tabs.Tab key="open" title="Open" />
        <Tabs.Tab key="closed" title="Closed" />
        {canManage && <Tabs.Tab key="drafts" title="Drafts" />}
        <Tabs.Tab key="all" title="All" />
      </Tabs>

      <PagedList
        emptyTitle={EMPTY_TITLES[view]}
        getKey={poll => poll._id ?? ''}
        itemsLabel="polls"
        paged={paged}
        emptyDescription={
          (view === 'open' || view === 'drafts') && canManage ? 'Tap + to create a poll.' : undefined
        }
        renderItem={poll => {
          const status = pollStatus(poll.status);
          let myVote: { label: string; color: 'success' | 'warning' } | null = null;
          if (poll.hasVoted) myVote = { label: 'Voted', color: 'success' };
          else if (poll.status === 'open' && poll.isEligible) myVote = { label: 'Not voted', color: 'warning' };
          return (
            <List.Item
              description={
                <>
                  <div>{describeClosing(poll)}</div>
                  <div>
                    {`${poll.voteCount ?? 0} voted`}
                    {poll.anonymous ? ' · Anonymous' : ''}
                  </div>
                </>
              }
              extra={
                <div className="polls-list-tags">
                  <Tag color={status.color} fill="outline">
                    {status.label}
                  </Tag>
                  {myVote && (
                    <Tag color={myVote.color} fill="outline">
                      {myVote.label}
                    </Tag>
                  )}
                </div>
              }
              prefix={
                <span className="list-icon">
                  <PieOutline />
                </span>
              }
              onClick={() => poll._id && history.push(WorkspacesPaths.committeePoll(committeeId, poll._id))}
            >
              {poll.title}
            </List.Item>
          );
        }}
      />
    </Page>
  );
};
