import React, { useState } from 'react';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {
  CheckOutlined,
  LockOutlined,
  PlusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Button, Flex, Pagination, Space, Table } from 'antd';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import type {
  LocationUsersQuery,
  LocationUsersQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
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

type UserRow = NonNullable<
  NonNullable<
    NonNullable<LocationUsersQuery['pagedOrgLocationUsers']>['data']
  >[number]
>;

// The columns of the Users list under Access Management, without the display
// name (the karkun's name is shown beside it).
const columns: any[] = [
  {
    key: 'locked',
    width: 40,
    render: (_text: unknown, record: UserRow) =>
      record.locked ? <LockOutlined /> : null,
  },
  {
    title: 'Email / User Name',
    key: 'username',
    render: (_text: unknown, record: UserRow) => (
      <Flex vertical>
        <Link to={`${paths.usersPath}/${record._id}`}>
          <span>{record.email}</span>
        </Link>
        <Link to={`${paths.usersPath}/${record._id}`}>
          <span>{record.username}</span>
        </Link>
      </Flex>
    ),
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

  const { data, loading, refetch } = useQuery(LOCATION_USERS, {
    variables: {
      locationId,
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
    },
    fetchPolicy: 'cache-and-network',
  });

  const paged = data?.pagedOrgLocationUsers;
  const users = (paged?.data ?? []).filter(
    (row): row is UserRow => row != null
  );

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={users}
        columns={columns}
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
      <LocationAddUserDrawer
        open={showAdd}
        locationId={locationId}
        onClose={() => setShowAdd(false)}
      />
    </div>
  );
};

export default LocationUsers;
