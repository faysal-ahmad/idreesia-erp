import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useApolloClient, useQuery } from '@apollo/client/react';
import { type RouteComponentProps } from 'react-router';
import { Button, Empty, Space, Spin, Tabs } from 'antd';
import { SyncOutlined, UserAddOutlined } from '@ant-design/icons';

import {
  useDynamicBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type {
  CommitteeByIdQuery,
  CommitteeByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  CommitteeMemberRoles,
  type CommitteeMemberRole,
} from 'meteor/idreesia-common/constants/organization';

import AddMemberDrawer from './add-member-drawer';
import GeneralInfo from './general-info';
import Features from './features';
import Members from './members';

const COMMITTEE_BY_ID: TypedDocumentNode<
  CommitteeByIdQuery,
  CommitteeByIdQueryVariables
> = gql`
  query committeeById($id: String!) {
    committeeById(id: $id) {
      _id
      name
      color
      description
      features
      memberCount
      guestCount
      observerCount
      # Only the ids: the tabs load the members themselves, a page at a time.
      members {
        karkunId
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

type Props = RouteComponentProps<{ committeeId: string }>;

const TAB_GENERAL = 'general';
const TAB_MEMBERS = 'members';
const TAB_GUESTS = 'guests';
const TAB_OBSERVERS = 'observers';
const TAB_FEATURES = 'features';
const VALID_TAB_KEYS = new Set([
  TAB_GENERAL,
  TAB_MEMBERS,
  TAB_GUESTS,
  TAB_OBSERVERS,
  TAB_FEATURES,
]);

const EditForm = ({ history, location, match }: Props) => {
  const committeeId = match.params.committeeId;
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['default-active-tab'],
    paramDefaultValues: { 'default-active-tab': TAB_GENERAL },
  });

  const requestedTab = String(queryParams['default-active-tab'] || TAB_GENERAL);
  const activeKey = VALID_TAB_KEYS.has(requestedTab) ? requestedTab : TAB_GENERAL;

  // The role being added, while the Add drawer is open.
  const [addRole, setAddRole] = useState<CommitteeMemberRole | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const apolloClient = useApolloClient();

  const { loading, data } = useQuery(COMMITTEE_BY_ID, {
    variables: { id: committeeId },
  });
  const committeeById = data?.committeeById;
  const committeeName = committeeById?.name?.trim();

  useDynamicBreadcrumbs(['Admin', 'Central Committees', committeeName || 'Edit']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!committeeById?._id) {
    return (
      <Empty description="Committee not found" style={{ padding: '80px 0' }} />
    );
  }

  const enabledFeatures = (committeeById.features ?? []).filter(
    (key): key is string => key != null
  );

  const allMemberIds = (committeeById.members ?? []).flatMap(member =>
    member?.karkunId ? [member.karkunId] : []
  );

  const addButtons: Array<{ role: CommitteeMemberRole; label: string }> = [
    { role: CommitteeMemberRoles.MEMBER, label: 'Add Member' },
    { role: CommitteeMemberRoles.GUEST, label: 'Add Guest' },
    { role: CommitteeMemberRoles.OBSERVER, label: 'Add Observer' },
  ];

  return (
    <>
    <Space style={{ marginBottom: 12 }}>
      {addButtons.map(({ role, label }) => (
        <Button
          key={role}
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setAddRole(role)}
        >
          {label}
        </Button>
      ))}
    </Space>
    <Tabs
      // Reloads the committee (general info, features, counts) and, only for
      // the tab that is showing, its members.
      tabBarExtraContent={
        <Button
          icon={<SyncOutlined />}
          title="Reload Data"
          loading={refreshing}
          onClick={() => {
            setRefreshing(true);
            apolloClient
              .refetchQueries({
                include: ['committeeById', 'committeeMembers'],
              })
              .finally(() => setRefreshing(false));
          }}
        />
      }
      activeKey={activeKey}
      onChange={key => {
        setPageParams({ 'default-active-tab': key });
      }}
      items={[
        {
          key: TAB_GENERAL,
          label: 'General Info',
          children: (
            <GeneralInfo
              history={history}
              committeeId={committeeById._id}
              committee={committeeById}
            />
          ),
        },
        {
          key: TAB_MEMBERS,
          label: `Members (${committeeById.memberCount ?? 0})`,
          children: (
            <Members
              committeeId={committeeById._id}
              roles={[CommitteeMemberRoles.MEMBER, CommitteeMemberRoles.COORDINATOR]}
              allowRoleChange
              emptyText="No members added yet"
            />
          ),
        },
        {
          key: TAB_GUESTS,
          label: `Guests (${committeeById.guestCount ?? 0})`,
          children: (
            <Members
              committeeId={committeeById._id}
              roles={[CommitteeMemberRoles.GUEST]}
              emptyText="No guests added yet"
              note="Guests can be added to Projects and Meetings and will have access to those specific projects/meetings only. They cannot see any other data in the committee."
            />
          ),
        },
        {
          key: TAB_OBSERVERS,
          label: `Observers (${committeeById.observerCount ?? 0})`,
          children: (
            <Members
              committeeId={committeeById._id}
              roles={[CommitteeMemberRoles.OBSERVER]}
              emptyText="No observers added yet"
              note="Observer users have read-only access to all data in the committee."
            />
          ),
        },
        {
          key: TAB_FEATURES,
          label: 'Features',
          children: (
            <Features
              committeeId={committeeById._id}
              enabledFeatures={enabledFeatures}
            />
          ),
        },
      ]}
    />
    <AddMemberDrawer
      committeeId={addRole ? committeeById._id : null}
      memberIds={allMemberIds}
      role={addRole ?? undefined}
      title={addButtons.find(button => button.role === addRole)?.label}
      onClose={() => setAddRole(null)}
    />
    </>
  );
};

export default EditForm;
