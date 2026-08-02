import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const RouterLink = Link as any;
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { type History, type Location } from 'history';
import { Pagination, Row, Table } from 'antd';
import { LockOutlined } from '@ant-design/icons';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import type { PagedSecurityUsersQuery } from 'meteor/idreesia-common/types/client-operations';

import { PersonName } from '/imports/ui/modules/helpers/controls';
import { PermissionSelection, SecurityPermissionsData } from '/imports/ui/modules/helpers/controls/access-management';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { PAGED_SECURITY_USERS } from '../gql';

type SecurityUserRow = NonNullable<
  NonNullable<NonNullable<PagedSecurityUsersQuery['pagedSecurityUsers']>['data']>[number]
>;

interface ListProps {
  history: History;
  location: Location;
}

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

  const { data, loading } = useQuery(PAGED_SECURITY_USERS, {
    variables: {
      filter: queryParams,
    },
  });

  if (loading) return null;
  const pagedSecurityUsers = data?.pagedSecurityUsers ?? {
    data: [],
    totalResults: 0,
  };
  const securityUsers = (pagedSecurityUsers.data ?? []).filter(
    (row): row is SecurityUserRow => row != null && row._id != null
  );

  const onPaginationChange = (index: number, size: number) => {
    setPageParams({
      pageIndex: index - 1,
      pageSize: size,
    });
  };

  const { pageIndex, pageSize } = queryParams;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const columns: any[] = [
    {
      key: 'locked',
      render: (_text: unknown, record: SecurityUserRow) => (record.locked ? <LockOutlined /> : null),
    },
    {
      title: 'Person Name',
      key: 'personName',
      render: (_text: unknown, record: SecurityUserRow) => {
        if (!record.person?._id) return null;
        const personData = {
          _id: record.person._id,
          name: record.person.sharedData?.name ?? '',
          imageId: record.person.sharedData?.imageId ?? undefined,
        };

        return (
          <PersonName person={personData} />
        );
      },
    },
    {
      title: 'User Login',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record: SecurityUserRow) => (
        <RouterLink to={paths.securityUsersEditFormPath(record._id!)}>{text}</RouterLink>
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
            <Row>{dayjs(Number(text)).format(Formats.DATE_FORMAT)}</Row>
            <Row>{dayjs(Number(text)).format(Formats.TIME_FORMAT)}</Row>
          </>
        );
      },
    },
    {
      title: 'Permissions',
      key: 'permissions',
      render: (_text: unknown, record: SecurityUserRow) => (
        <PermissionSelection
          readOnly
          permissions={[SecurityPermissionsData]}
          securityEntity={{
            permissions: (record.permissions ?? []).filter(
              (permission): permission is string => permission != null
            ),
          }}
          onChange={() => {}}
        />
      ),
    },
  ];

  return (
    <Table
      rowKey="_id"
      dataSource={securityUsers}
      columns={columns}
      bordered
      pagination={false}
      size="small"
      footer={() => (
        <Pagination
          current={numPageIndex + 1}
          pageSize={numPageSize}
          showSizeChanger
          showTotal={(total: number, range: number[]) =>
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={onPaginationChange}
          onShowSizeChange={onPaginationChange}
          total={pagedSecurityUsers.totalResults ?? 0}
        />
      )}
    />
  );
};

export default List;
