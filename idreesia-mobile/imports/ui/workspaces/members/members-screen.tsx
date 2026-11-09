import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { ActionSheet, Avatar, Badge, List, PullToRefresh, Tag } from 'antd-mobile';
import { BellOutline, LockOutline } from 'antd-mobile-icons';
import { toDeviceUrl } from '/imports/startup/backend';

import { WorkspacesPaths } from '../paths';
import { Page, PageError, PageLoading, PageEmpty, showError, showSuccess } from '../../layout';
import { useHistory, useParams } from '../../router';
import { MOBILE_MY_NOTIFICATION_COUNTS } from '../gql';
import { MOBILE_SET_COMMITTEE_MEMBER_COORDINATOR, MOBILE_WORKSPACE_COMMITTEE_MEMBERS } from './gql';

/** A workspace's members: coordinators first, then by name. */
export const MembersScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  // Unread membership notifications, for the bell. Best effort.
  const { data: countData, refetch: refetchCounts } = useQuery(MOBILE_MY_NOTIFICATION_COUNTS, {
    fetchPolicy: 'cache-and-network',
  });
  const unreadCount = (countData?.myNotificationCounts ?? [])
    .filter(row => row?.committeeId === committeeId && row.module === 'members')
    .reduce((total, row) => total + (row?.unreadCount ?? 0), 0);
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_COMMITTEE_MEMBERS, {
    variables: { committeeId },
    fetchPolicy: 'cache-and-network',
  });

  const [setCoordinator] = useMutation(MOBILE_SET_COMMITTEE_MEMBER_COORDINATOR);
  // The member whose actions are open: call them, and (coordinators only)
  // change their coordinator status.
  const [selected, setSelected] = useState<{
    karkunId: string;
    name: string;
    isCoordinator: boolean;
    phones: string[];
  } | null>(null);

  const changeCoordinator = (isCoordinator: boolean) => {
    if (!selected) return;
    const { karkunId, name } = selected;
    setCoordinator({ variables: { committeeId, karkunId, isCoordinator } })
      .then(() => {
        showSuccess(isCoordinator ? `${name} is now a coordinator.` : `${name} is no longer a coordinator.`);
        return refetch();
      })
      .catch(failure => showError(failure, 'Could not change the coordinator.'));
  };

  // Pulling to refresh also refreshes the bell's count: this screen stays
  // mounted under its notifications, so the count wouldn't otherwise change.
  const refresh = () => Promise.all([refetch(), refetchCounts()]).then(
    () => undefined,
    () => undefined,
  );

  const committee = data?.workspaceCommitteeById;

  let content;
  if (loading && !data) {
    content = <PageLoading />;
  } else if (error && !data) {
    content = <PageError error={error} onRetry={refresh} />;
  } else if (!committee) {
    // Pullable too, so being added on the web shows up without leaving.
    content = (
      <PullToRefresh onRefresh={refresh}>
        <PageEmpty
          description="You aren't a member of this workspace."
          icon={<LockOutline />}
          title="Not a member"
        />
      </PullToRefresh>
    );
  } else {
    const members = (committee.members ?? [])
      .filter(
        (member): member is NonNullable<typeof member> & { karkunId: string } =>
          member?.karkunId != null,
      )
      .sort(
        (a, b) =>
          Number(Boolean(b.isCoordinator)) - Number(Boolean(a.isCoordinator)) ||
          (a.name ?? '').localeCompare(b.name ?? ''),
      );

    content = (
      <PullToRefresh onRefresh={refresh}>
        <List header={committee.name} mode="card">
          {members.map(member => {
            const phones = [member.contactNumber1, member.contactNumber2].filter(
              (phone): phone is string => Boolean(phone),
            );
            return (
              <List.Item
                key={member.karkunId}
                arrowIcon={false}
                clickable
                className="workspace-member-item"
                description={
                  phones.length > 0 && (
                    <span className="workspace-member-phones">
                      {phones.map(phone => (
                        <span key={phone}>{phone}</span>
                      ))}
                    </span>
                  )
                }
                extra={
                  member.isCoordinator && (
                    <Tag color="primary" fill="outline">
                      CO
                    </Tag>
                  )
                }
                onClick={() =>
                  setSelected({
                    karkunId: member.karkunId,
                    name: member.name ?? 'This person',
                    isCoordinator: Boolean(member.isCoordinator),
                    phones,
                  })
                }
                prefix={
                  <Avatar
                    className="workspace-member-avatar"
                    src={toDeviceUrl(member.imageThumbnailUrl ?? member.imageUrl) ?? ''}
                  />
                }
              >
                {member.name}
              </List.Item>
            );
          })}
        </List>
      </PullToRefresh>
    );
  }

  return (
    <Page
      backTo={WorkspacesPaths.root}
      right={
        <Badge content={unreadCount > 0 ? unreadCount : null}>
          <BellOutline
            aria-label="Notifications"
            className="workspace-members-bell"
            onClick={() => history.push(WorkspacesPaths.committeeMemberNotifications(committeeId))}
          />
        </Badge>
      }
      title="Members"
    >
      {content}
      <ActionSheet
        actions={
          selected
            ? [
                ...selected.phones.map(phone => ({
                  key: `call-${phone}`,
                  text: `Call ${phone}`,
                  onClick: () => {
                    window.location.href = `tel:${phone}`;
                  },
                })),
                ...(committee?.canManageMembers
                  ? [
                      selected.isCoordinator
                        ? {
                            key: 'demote',
                            text: 'Remove as Coordinator',
                            danger: true,
                            onClick: () => changeCoordinator(false),
                          }
                        : {
                            key: 'promote',
                            text: 'Make Coordinator',
                            onClick: () => changeCoordinator(true),
                          },
                    ]
                  : []),
              ]
            : []
        }
        cancelText="Cancel"
        closeOnAction
        extra={selected?.name}
        visible={selected != null}
        onClose={() => setSelected(null)}
      />
    </Page>
  );
};
