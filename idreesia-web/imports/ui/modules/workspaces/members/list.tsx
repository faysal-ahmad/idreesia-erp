import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { Button, Empty, Flex, Space, Spin, Tabs } from 'antd';
import { PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';

import {
  CommitteeFeatureKeys,
  CommitteeMemberRoles,
} from 'meteor/idreesia-common/constants/organization';

import AddMemberDrawer from './add-member-drawer';
import MembersTable, { type Member } from './members-table';
import { WORKSPACE_COMMITTEE_MEMBERS } from './gql';

const List = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  // The role being added, while the Add drawer is open.
  const [addRole, setAddRole] = useState<'member' | 'guest' | null>(null);

  const { data, loading, error, refetch } = useQuery(
    WORKSPACE_COMMITTEE_MEMBERS,
    {
      variables: { committeeId: committeeId! },
      skip: !committeeId,
      fetchPolicy: 'cache-and-network',
    }
  );

  if (loading && !data) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Spin />
      </Flex>
    );
  }

  // E.g. the Members feature is not enabled for this committee.
  if (error && !data) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Empty description={error.message} />
      </Flex>
    );
  }

  const committee = data?.workspaceCommitteeById;
  if (!committee) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Empty description="You are not a member of this committee." />
      </Flex>
    );
  }

  const canManageMembers = !!committee.canManageMembers;
  const discussionsEnabled = !!committee.features?.includes(
    CommitteeFeatureKeys.DISCUSSIONS
  );
  const members = (committee.members ?? []).filter(
    (member): member is Member => member != null && member.karkunId != null
  );
  const allMemberIds = members.map(member => member.karkunId!);
  const withRole = (...roles: string[]) =>
    members.filter(member => roles.includes(member.role ?? 'member'));

  const common = {
    committeeId: committeeId!,
    canManageMembers,
    discussionsEnabled,
    refetch: () => {
      refetch();
    },
  };

  // Observers are managed by admins, so there is no Add Observer here.
  const addButtons = [
    { role: CommitteeMemberRoles.MEMBER, label: 'Add Member' },
    { role: CommitteeMemberRoles.GUEST, label: 'Add Guest' },
  ] as const;

  return (
    <>
    {canManageMembers ? (
      <Space style={{ marginBottom: 12 }}>
        {addButtons.map(({ role, label }) => (
          <Button
            key={role}
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={() => setAddRole(role)}
          >
            {label}
          </Button>
        ))}
      </Space>
    ) : null}
    <Tabs
      // Every tab reads from the same query, so this reloads whichever tab is
      // active.
      tabBarExtraContent={
        <Button
          icon={<SyncOutlined />}
          onClick={() => {
            refetch();
          }}
          title="Reload Data"
        />
      }
      items={[
        {
          key: 'members',
          label: `Members (${committee.memberCount ?? 0})`,
          children: (
            <MembersTable
              {...common}
              members={withRole(
                CommitteeMemberRoles.MEMBER,
                CommitteeMemberRoles.COORDINATOR
              )}
              allowRoleChange
              allowRemove
              emptyText="No members yet"
            />
          ),
        },
        {
          key: 'guests',
          label: `Guests (${committee.guestCount ?? 0})`,
          children: (
            <MembersTable
              {...common}
              members={withRole(CommitteeMemberRoles.GUEST)}
              allowRemove
              emptyText="No guests yet"
              note="Guests can be added to Projects and Meetings and will have access to those specific projects/meetings only. They cannot see any other data in the committee."
            />
          ),
        },
        {
          key: 'observers',
          label: `Observers (${committee.observerCount ?? 0})`,
          // Observers are managed by admins; this tab is view-only.
          children: (
            <MembersTable
              {...common}
              members={withRole(CommitteeMemberRoles.OBSERVER)}
              allowRemove={false}
              emptyText="No observers yet"
              note="Observer users have read-only access to all data in the committee."
            />
          ),
        },
      ]}
    />
    {canManageMembers ? (
      <AddMemberDrawer
        open={addRole != null}
        committeeId={committeeId!}
        memberIds={allMemberIds}
        role={addRole ?? undefined}
        title={addButtons.find(button => button.role === addRole)?.label}
        onClose={() => setAddRole(null)}
        onMemberAdded={() => {
          refetch();
        }}
      />
    ) : null}
    </>
  );
};

export default List;
