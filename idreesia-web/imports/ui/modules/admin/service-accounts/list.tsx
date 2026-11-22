import React from 'react';
import { Link } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { LockOutlined, PlusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Flex, Pagination, Space, Spin, Table } from 'antd';

import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type { PagedUsersQuery } from 'meteor/idreesia-common/types/client-operations';

import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import { PAGED_USERS } from '../users/gql';

type AccountRow = NonNullable<
  NonNullable<NonNullable<PagedUsersQuery['pagedUsers']>['data']>[number]
>;

const columns = [
  {
    key: 'locked',
    width: 40,
    render: (_text: unknown, record: AccountRow) =>
      record.locked ? <LockOutlined /> : null,
  },
  {
    title: 'User Name / Display Name',
    key: 'username',
    render: (_text: unknown, record: AccountRow) => (
      <Flex vertical>
        <Link to={`${paths.serviceAccountsPath}/${record._id}`}>
          <span>{record.username}</span>
        </Link>
        <span>{record.displayName}</span>
      </Flex>
    ),
  },
];

const List = ({ history, location }: RouteComponentProps) => {
  const { containerRef, scrollY } = useListScrollY();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['pageIndex', 'pageSize'],
  });

  useBreadcrumbs(['Admin', 'Service Accounts', 'List']);

  const { data, loading, refetch } = useQuery(PAGED_USERS, {
    variables: { filter: { ...queryParams, serviceAccounts: 'true' } },
  });

  const paged = data?.pagedUsers;
  const accounts = (paged?.data ?? []).filter(
    (row): row is AccountRow => row != null
  );
  const numPageIndex = queryParams.pageIndex
    ? toSafeInteger(queryParams.pageIndex)
    : 0;
  const numPageSize = queryParams.pageSize
    ? toSafeInteger(queryParams.pageSize)
    : 20;

  const onPaginationChange = (index: number, size?: number) => {
    setPageParams({ pageIndex: index - 1, pageSize: size ?? 20 });
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={() => history.push(paths.serviceAccountsNewFormPath)}
        >
          New Service Account
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
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={accounts}
        columns={columns}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        title={getTableHeader}
        footer={() => (
          <Pagination
            current={numPageIndex + 1}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={onPaginationChange}
            onShowSizeChange={onPaginationChange}
            total={paged?.totalResults ?? 0}
          />
        )}
      />
    </div>
  );
};

export default List;
