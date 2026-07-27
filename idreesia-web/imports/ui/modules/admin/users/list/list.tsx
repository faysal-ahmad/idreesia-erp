import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import { LockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Button, Flex, Pagination, Table } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { noop, toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';

import { KarkunName } from '/imports/ui/modules/hr/common/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import ListFilter from './list-filter';
import { PAGED_USERS } from '../gql';

const RouterLink = Link as any;
const AntLockOutlined = LockOutlined as any;
const AntButton = Button as any;
const AntFlex = Flex as any;
const AntPagination = Pagination as any;
const AntTable = Table as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const KarkunNameControl = KarkunName as any;
type AnyRecord = Record<string, any>;
interface HistoryLike { push(path: string): void; }
interface LocationLike { pathname: string; search: string; }
interface PagedUsers { totalResults: number; data: AnyRecord[]; }
interface QueryData { pagedUsers?: PagedUsers | null; }
interface Props { history: HistoryLike; location: LocationLike; }

const columns: any[] = [
  {
    key: 'locked',
    render: (_text: unknown, record: AnyRecord) => (record.locked ? <AntLockOutlined /> : null),
  },
  {
    title: 'Email / User Name / Display Name',
    key: 'username',
    render: (_text: unknown, record: AnyRecord) => (
      <AntFlex vertical>
        <RouterLink to={`${paths.usersPath}/${record._id}`}>
          <span>{record.email}</span>
        </RouterLink>
        <RouterLink to={`${paths.usersPath}/${record._id}`}>
          <span>{record.username}</span>
        </RouterLink>
        <span>{record.displayName}</span>
      </AntFlex>
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
    render: (_text: unknown, record: AnyRecord) =>
      record.karkun ? (
        <KarkunNameControl karkun={record.karkun} onKarkunNameClicked={noop} />
      ) : (
        ''
      ),
  },
];

const List = ({ history, location }: Props) => {
  const dispatch = useDispatch<any>();
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

  useEffect(() => {
    dispatch(setBreadcrumbs(['Admin', 'Users', 'List']));
  }, [location]);

  const { data, loading, refetch } = useQuery(PAGED_USERS as any, {
    variables: {
      filter: queryParams,
    },
  });

  if (loading) return null;
  const { pagedUsers } = (data ?? {}) as QueryData;

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
  const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const getTableHeader = () => (
    <div className="list-table-header">
      <AntButton
        size="large"
        type="primary"
        icon={<AntPlusCircleOutlined />}
        onClick={handleNewClicked}
      >
        New User
      </AntButton>
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
    <AntTable
      rowKey="_id"
      dataSource={pagedUsers?.data ?? []}
      columns={columns as any}
      bordered
      pagination={false}
      size="small"
      title={getTableHeader}
      footer={() => (
        <AntPagination
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

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
