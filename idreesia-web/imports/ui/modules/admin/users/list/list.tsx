import React from 'react';
import { Link } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { LockOutlined, PlusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Button, Flex, Pagination, Table } from 'antd';

import { noop, toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type { PagedUsersQuery } from 'meteor/idreesia-common/types/client-operations';

import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import ListFilter from './list-filter';
import { PAGED_USERS } from '../gql';

const RouterLink = Link as any;

type UserRow = NonNullable<
  NonNullable<NonNullable<PagedUsersQuery['pagedUsers']>['data']>[number]
>;

type Props = RouteComponentProps;

const columns: any[] = [
  {
    key: 'locked',
    render: (_text: unknown, record: UserRow) =>
      record.locked ? <LockOutlined /> : null,
  },
  {
    title: 'Email / User Name / Display Name',
    key: 'username',
    render: (_text: unknown, record: UserRow) => (
      <Flex vertical>
        <RouterLink to={`${paths.usersPath}/${record._id}`}>
          <span>{record.email}</span>
        </RouterLink>
        <RouterLink to={`${paths.usersPath}/${record._id}`}>
          <span>{record.username}</span>
        </RouterLink>
        <span>{record.displayName}</span>
      </Flex>
    ),
  },
  {
    title: 'Last Active',
    dataIndex: 'lastActiveAt',
    key: 'lastActiveAt',
    render: (text: string | number) => {
      if (!text) return '';
      return dayjs(Number(text)).format(Formats.DATE_TIME_FORMAT);
    },
  },
  {
    title: 'Karkun Name',
    key: 'karkun.name',
    render: (_text: unknown, record: UserRow) =>
      record.karkun ? (
        <KarkunName karkun={record.karkun} onKarkunNameClicked={noop} />
      ) : (
        ''
      ),
  },
];

const List = ({ history, location }: Props) => {
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'showLocked',
      'showUnlocked',
      'showActive',
      'showInactive',
      'moduleAccess',
      'pageIndex',
      'pageSize',
    ],
    paramDefaultValues: {
      showLocked: 'false',
      showUnlocked: 'true',
      showActive: 'true',
      showInactive: 'true',
    },
  });

  useBreadcrumbs(['Admin', 'Users', 'List']);

  const { data, loading, refetch } = useQuery(PAGED_USERS, {
    variables: {
      filter: queryParams,
    },
  });

  if (loading) return null;
  const pagedUsers = data?.pagedUsers;
  const users = (pagedUsers?.data ?? []).filter(
    (row): row is UserRow => row != null
  );

  const onPaginationChange = (index: number, size?: number) => {
    setPageParams({
      pageIndex: index - 1,
      pageSize: size ?? 20,
    });
  };

  const handleNewClicked = () => {
    history.push(paths.usersNewFormPath);
  };

  const {
    showLocked,
    showUnlocked,
    showActive,
    showInactive,
    moduleAccess,
    pageIndex,
    pageSize,
  } = queryParams;
  const asString = (value: unknown, fallback = '') =>
    typeof value === 'string' ? value : fallback;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getTableHeader = () => (
    <div className="list-table-header">
      <Button
        size="large"
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={handleNewClicked}
      >
        New User
      </Button>
      <ListFilter
        showLocked={asString(showLocked)}
        showUnlocked={asString(showUnlocked)}
        showActive={asString(showActive)}
        showInactive={asString(showInactive)}
        moduleAccess={asString(moduleAccess)}
        setPageParams={setPageParams}
        refreshData={refetch}
      />
    </div>
  );

  return (
    <Table
      rowKey="_id"
      dataSource={users}
      columns={columns as any}
      bordered
      pagination={false}
      size="small"
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
          total={pagedUsers?.totalResults ?? 0}
        />
      )}
    />
  );
};

export default List;
