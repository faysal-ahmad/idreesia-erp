import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  CheckOutlined,
  DownOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  Button,
  Dropdown,
  Form,
  Input,
  Modal,
  Pagination,
  Space,
  Table,
} from 'antd';
import { message, modal } from '/imports/ui/antd-feedback';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import type {
  CreateOrgLocationUserChatAccountMutation,
  CreateOrgLocationUserChatAccountMutationVariables,
  ResetOrgLocationUserPasswordMutation,
  ResetOrgLocationUserPasswordMutationVariables,
  SetOrgLocationUserLockedMutation,
  SetOrgLocationUserLockedMutationVariables,
  LocationUsersQuery,
  LocationUsersQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import { PersonName } from '/imports/ui/modules/helpers/controls';
import LocationAddUserDrawer from './location-add-user-drawer';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

const LOCATION_USERS: TypedDocumentNode<
  LocationUsersQuery,
  LocationUsersQueryVariables
> = gql`
  query locationUsers($locationId: String!, $pageIndex: String, $pageSize: String) {
    pagedOrgLocationUsers(
      locationId: $locationId
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        username
        email
        locked
        lastActiveAt
        hasChatAccount
        twoFactorEnabled
        karkun {
          _id
          sharedData {
            name
            imageUrl
            imageThumbnailUrl
          }
        }
      }
    }
  }
`;

const RESET_PASSWORD: TypedDocumentNode<
  ResetOrgLocationUserPasswordMutation,
  ResetOrgLocationUserPasswordMutationVariables
> = gql`
  mutation resetOrgLocationUserPassword(
    $locationId: String!
    $userId: String!
    $password: String!
  ) {
    resetOrgLocationUserPassword(
      locationId: $locationId
      userId: $userId
      password: $password
    ) {
      _id
    }
  }
`;

const SET_LOCKED: TypedDocumentNode<
  SetOrgLocationUserLockedMutation,
  SetOrgLocationUserLockedMutationVariables
> = gql`
  mutation setOrgLocationUserLocked(
    $locationId: String!
    $userId: String!
    $locked: Boolean!
  ) {
    setOrgLocationUserLocked(
      locationId: $locationId
      userId: $userId
      locked: $locked
    ) {
      _id
      locked
    }
  }
`;

const CREATE_CHAT_ACCOUNT: TypedDocumentNode<
  CreateOrgLocationUserChatAccountMutation,
  CreateOrgLocationUserChatAccountMutationVariables
> = gql`
  mutation createOrgLocationUserChatAccount(
    $locationId: String!
    $userId: String!
  ) {
    createOrgLocationUserChatAccount(locationId: $locationId, userId: $userId) {
      _id
      hasChatAccount
    }
  }
`;

type UserRow = NonNullable<
  NonNullable<
    NonNullable<LocationUsersQuery['pagedOrgLocationUsers']>['data']
  >[number]
>;

interface RowActions {
  onResetPassword(user: UserRow): void;
  onToggleLocked(user: UserRow): void;
  onCreateChatAccount(user: UserRow): void;
}

// The columns of the Users list under Access Management, without the display
// name (the karkun's name is shown beside it). The limited account actions
// of a location's managers are in the last column.
const getColumns = (actions: RowActions): any[] => [
  {
    title: 'Email / User Name',
    key: 'username',
    render: (_text: unknown, record: UserRow) => (
      <div>
        {record.email ? <div>{record.email}</div> : null}
        <div>{record.username}</div>
      </div>
    ),
  },
  {
    title: 'Locked',
    key: 'lockedStatus',
    width: 100,
    align: 'center',
    render: (_text: unknown, record: UserRow) =>
      record.locked ? <CheckOutlined /> : null,
  },
  {
    title: 'Last Active',
    dataIndex: 'lastActiveAt',
    key: 'lastActiveAt',
    width: 180,
    render: (text: string | number) => {
      if (!text) return '';
      return dayjs(Number(text)).format(Formats.DATE_TIME_FORMAT);
    },
  },
  {
    title: 'Chat Account',
    key: 'hasChatAccount',
    width: 120,
    align: 'center',
    render: (_text: unknown, record: UserRow) =>
      record.hasChatAccount ? <CheckOutlined /> : null,
  },
  {
    title: 'Two-Factor',
    key: 'twoFactorEnabled',
    width: 110,
    align: 'center',
    render: (_text: unknown, record: UserRow) =>
      record.twoFactorEnabled ? <CheckOutlined /> : null,
  },
  {
    title: 'Karkun Name',
    key: 'karkun.name',
    render: (_text: unknown, record: UserRow) =>
      record.karkun?._id && record.karkun.sharedData?.name ? (
        <PersonName
          person={{
            _id: record.karkun._id,
            name: record.karkun.sharedData.name,
            imageUrl: record.karkun.sharedData.imageUrl ?? undefined,
            imageThumbnailUrl:
              record.karkun.sharedData.imageThumbnailUrl ?? undefined,
          }}
          onPersonNameClicked={noop}
        />
      ) : (
        ''
      ),
  },
  {
    key: 'actions',
    width: 70,
    align: 'center',
    render: (_text: unknown, record: UserRow) => (
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            {
              key: 'reset-password',
              label: 'Reset Password',
              onClick: () => actions.onResetPassword(record),
            },
            {
              key: 'toggle-locked',
              label: record.locked ? 'Unlock Account' : 'Lock Account',
              onClick: () => actions.onToggleLocked(record),
            },
            ...(record.hasChatAccount
              ? []
              : [
                  {
                    key: 'create-chat-account',
                    label: 'Create Chat Account',
                    onClick: () => actions.onCreateChatAccount(record),
                  },
                ]),
          ],
        }}
      >
        <Button icon={<DownOutlined />} size="small" />
      </Dropdown>
    ),
  },
];

const DEFAULT_PAGE_SIZE = 20;

interface Props {
  locationId: string;
}

// The user accounts of the mehfil's karkuns.
const LocationUsers = ({ locationId }: Props) => {
  const { containerRef, scrollY } = useListScrollY();
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showAdd, setShowAdd] = useState(false);
  const [resetFor, setResetFor] = useState<UserRow | null>(null);
  const [password, setPassword] = useState('');

  const { data, loading, refetch } = useQuery(LOCATION_USERS, {
    variables: {
      locationId,
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
    },
    fetchPolicy: 'cache-and-network',
  });

  const [resetPassword, { loading: resettingPassword }] =
    useMutation(RESET_PASSWORD);
  const [setLocked] = useMutation(SET_LOCKED, {
    refetchQueries: ['locationUsers'],
  });
  const [createChatAccount] = useMutation(
    CREATE_CHAT_ACCOUNT,
    { refetchQueries: ['locationUsers'] }
  );

  const paged = data?.pagedOrgLocationUsers;
  const users = (paged?.data ?? []).filter(
    (row): row is UserRow & { _id: string } => row?._id != null
  );
  const reportError = (error: Error) => message.error(error.message, 5);

  const handleResetPassword = () => {
    if (!resetFor?._id || !password) return;
    resetPassword({ variables: { locationId, userId: resetFor._id, password } })
      .then(() => {
        message.success('Password updated', 2);
        closeReset();
      })
      .catch(reportError);
  };

  const closeReset = () => {
    setResetFor(null);
    setPassword('');
  };

  const handleToggleLocked = (user: UserRow) => {
    if (!user._id) return;
    const userId = user._id;
    const locked = !user.locked;
    modal.confirm({
      title: locked ? 'Lock this account?' : 'Unlock this account?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () =>
        setLocked({ variables: { locationId, userId, locked } })
          .then(() =>
            message.success(locked ? 'Account locked' : 'Account unlocked', 2)
          )
          .catch(reportError),
    });
  };

  const handleCreateChatAccount = (user: UserRow) => {
    if (!user._id) return;
    createChatAccount({ variables: { locationId, userId: user._id } })
      .then(() => message.success('Chat account created', 2))
      .catch(reportError);
  };

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={users}
        columns={getColumns({
          onResetPassword: setResetFor,
          onToggleLocked: handleToggleLocked,
          onCreateChatAccount: handleCreateChatAccount,
        })}
        loading={loading && !data}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        locale={{ emptyText: 'No karkuns of this mehfil have a user account' }}
        title={() => (
          <div className="list-table-header">
            <Space size={12}>
              <Button
                type="primary"
                icon={<PlusCircleOutlined />}
                onClick={() => setShowAdd(true)}
              >
                Add User
              </Button>
            </Space>
            <div className="list-table-header-utilities">
              <Space size={8}>
                <Button
                  icon={<SyncOutlined />}
                  onClick={() => refetch()}
                  title="Reload Data"
                />
              </Space>
            </div>
          </div>
        )}
        footer={() => (
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={(page, size) => {
              setPageIndex(page - 1);
              setPageSize(size);
            }}
            total={paged?.totalResults ?? 0}
          />
        )}
      />
      <Modal
        title={`Reset Password – ${resetFor?.username ?? ''}`}
        open={resetFor != null}
        okText="Update"
        okButtonProps={{ disabled: !password }}
        confirmLoading={resettingPassword}
        onOk={handleResetPassword}
        onCancel={closeReset}
        destroyOnHidden
      >
        <Form layout="vertical" style={{ width: '100%' }} onFinish={handleResetPassword}>
          <Form.Item label="New password" required>
            <Input.Password
              autoFocus
              autoComplete="new-password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              onPressEnter={handleResetPassword}
            />
          </Form.Item>
        </Form>
      </Modal>
      <LocationAddUserDrawer
        open={showAdd}
        locationId={locationId}
        onClose={() => setShowAdd(false)}
      />
    </div>
  );
};

export default LocationUsers;
