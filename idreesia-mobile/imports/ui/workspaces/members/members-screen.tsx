import React from 'react';
import { useQuery } from '@apollo/client/react';
import { Avatar, List, PullToRefresh, Tag } from 'antd-mobile';
import { LockOutline } from 'antd-mobile-icons';
import { toDeviceUrl } from '/imports/startup/backend';

import { WorkspacesPaths } from '../paths';
import { Page, PageError, PageLoading, PageEmpty } from '../../layout';
import { useParams } from '../../router';
import { MOBILE_WORKSPACE_COMMITTEE_MEMBERS } from './gql';

/** A workspace's members: coordinators first, then by name. */
export const MembersScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_COMMITTEE_MEMBERS, {
    variables: { committeeId },
    fetchPolicy: 'cache-and-network',
  });

  const refresh = () => refetch().then(
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
                className="workspace-member-item"
                description={
                  phones.length > 0 && (
                    <span className="workspace-member-phones">
                      {phones.map(phone => (
                        <a key={phone} href={`tel:${phone}`}>
                          {phone}
                        </a>
                      ))}
                    </span>
                  )
                }
                extra={
                  member.isCoordinator && (
                    <Tag color="primary" fill="outline">
                      Coordinator
                    </Tag>
                  )
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
    <Page backTo={WorkspacesPaths.root} title="Members">
      {content}
    </Page>
  );
};
