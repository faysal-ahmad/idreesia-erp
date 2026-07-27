import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { Pagination, Row, Table } from 'antd';
import { LockOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';

import { PersonName } from '/imports/ui/modules/helpers/controls';
import { PermissionSelection, SecurityPermissionsData } from '/imports/ui/modules/helpers/controls/access-management';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { PAGED_SECURITY_USERS } from '../gql';

const RouterLink = Link as any;
const AntPagination = Pagination as any;
const AntRow = Row as any;
const AntTable = Table as any;
const AntLockOutlined = LockOutlined as any;
const PersonNameComponent = PersonName as any;
const PermissionSelectionComponent = PermissionSelection as any;

interface HistoryLike {
  push(path: string): void;
}

interface LocationLike {
  pathname: string;
  search: string;
}

interface ListProps {
  history: HistoryLike;
  location: LocationLike;
}

interface QueryParams {
  pageIndex?: string;
  pageSize?: string;
}

interface PersonRecord {
  _id: string;
  sharedData: {
    name?: string;
    imageId?: string;
  };
}

interface SecurityUser {
  _id: string;
  username?: string;
  locked?: boolean;
  lastActiveAt?: string | number | null;
  person?: PersonRecord | null;
}

interface PagedSecurityUsers {
  data: SecurityUser[];
  totalResults: number;
}

interface SecurityUsersData {
  pagedSecurityUsers?: PagedSecurityUsers;
}

const emptyPagedSecurityUsers: PagedSecurityUsers = {
  data: [],
  totalResults: 0,
};

const List = ({ history, location }: ListProps) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'pageIndex',
      'pageSize',
    ],
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Security', 'User Accounts', 'List']));
  }, [dispatch, location]);

  const { data, loading } = useQuery(PAGED_SECURITY_USERS as any, {
    variables: {
      filter: queryParams,
    },
  });

  if (loading) return null;
  const { pagedSecurityUsers = emptyPagedSecurityUsers } = (data ?? {}) as SecurityUsersData;

  const onPaginationChange = (index: number, size: number) => {
    setPageParams({
      pageIndex: index - 1,
      pageSize: size,
    });
  };

  const { pageIndex, pageSize } = queryParams as QueryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const columns: any[] = [
    {
      key: 'locked',
      render: (_text: unknown, record: SecurityUser) => (record.locked ? <AntLockOutlined /> : null),
    },
    {
      title: 'Person Name',
      key: 'personName',
      render: (_text: unknown, record: SecurityUser) => {
        if (!record.person) return null;
        const personData = {
          _id: record.person._id,
          name: record.person.sharedData.name,
          imageId: record.person.sharedData.imageId,
        };

        return (
          <PersonNameComponent person={personData} />
        );
      },
    },
    {
      title: 'User Login',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: SecurityUser) => (
        <RouterLink to={paths.securityUsersEditFormPath(record._id)}>{text}</RouterLink>
      ),
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActiveAt',
      key: 'lastActiveAt',
      render: (text: string | number | null) => {
        if (!text) return '';
        return (
          <>
            <AntRow>{dayjs(Number(text)).format(Formats.DATE_FORMAT)}</AntRow>
            <AntRow>{dayjs(Number(text)).format(Formats.TIME_FORMAT)}</AntRow>
          </>
        );
      },
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_text: unknown, record: SecurityUser) => (
        <PermissionSelectionComponent
          readOnly
          permissions={[SecurityPermissionsData]}
          securityEntity={record}
          onChange={() => {}}
        />
      ),
    },
  ];

  return (
    <AntTable
      rowKey="_id"
      dataSource={pagedSecurityUsers.data}
      columns={columns}
      bordered
      pagination={false}
      size="small"
      footer={() => (
        <AntPagination
          current={numPageIndex + 1}
          pageSize={numPageSize}
          showSizeChanger
          showTotal={(total: number, range: number[]) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onPaginationChange}
          onShowSizeChange={onPaginationChange}
          total={pagedSecurityUsers.totalResults}
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
