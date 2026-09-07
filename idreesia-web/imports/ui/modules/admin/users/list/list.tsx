import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import { LockOutlined, PlusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Button, Flex, Pagination, Space, Spin, Table } from 'antd';

import { noop, toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import type { PagedUsersQuery } from 'meteor/idreesia-common/types/client-operations';

import { PersonName } from '/imports/ui/modules/helpers/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import ListFilter, { UserFilterChips } from './list-filter';
import { PAGED_USERS } from '../gql';

const RouterLink = Link as any;

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type UserRow = NonNullable<
  NonNullable<NonNullable<PagedUsersQuery['pagedUsers']>['data']>[number]
>;

type Props = RouteComponentProps;

const columns: any[] = [
  {
    key: 'locked',
    width: 40,
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
    width: 180,
    render: (text: string | number) => {
      if (!text) return '';
      return dayjs(Number(text)).format(Formats.DATE_TIME_FORMAT);
    },
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
            imageId: record.karkun.sharedData.imageId ?? undefined,
            imageThumbnailId:
              record.karkun.sharedData.imageThumbnailId ?? undefined,
          }}
          onPersonNameClicked={noop}
        />
      ) : (
        ''
      ),
  },
];

const List = ({ history, location }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);

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

  const updateScrollY = () => {
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;

      const table = container.querySelector('.list-table');
      if (!table) return;

      const title = table.querySelector('.ant-table-title');
      const footer = table.querySelector('.ant-table-footer');
      const thead = table.querySelector('.ant-table-thead');
      const titleBottom = title
        ? title.getBoundingClientRect().bottom
        : table.getBoundingClientRect().top;
      const theadHeight = thead
        ? Math.ceil((thead as HTMLElement).getBoundingClientRect().height)
        : TABLE_HEADER_ROW_HEIGHT;
      const footerHeight = footer
        ? Math.ceil((footer as HTMLElement).getBoundingClientRect().height)
        : 64;

      const contentEl = container.closest(
        '.ant-layout-content'
      ) as HTMLElement | null;
      let bottomLimit = window.innerHeight;
      if (contentEl) {
        const paddingBottom =
          Number.parseFloat(getComputedStyle(contentEl).paddingBottom) || 0;
        bottomLimit = contentEl.getBoundingClientRect().bottom - paddingBottom;
      }

      const nextScrollY = Math.max(
        200,
        Math.floor(
          bottomLimit - titleBottom - theadHeight - footerHeight - VIEWPORT_BOTTOM_GAP
        )
      );

      setScrollY(prev => (Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev));
    });
  };

  useEffect(() => {
    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

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

  const handleRefresh = () => {
    refetch();
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

  const filterProps = {
    showLocked: asString(showLocked),
    showUnlocked: asString(showUnlocked),
    showActive: asString(showActive),
    showInactive: asString(showInactive),
    moduleAccess: asString(moduleAccess),
    setPageParams,
    refreshData: handleRefresh,
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleNewClicked}
        >
          New User
        </Button>
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <ListFilter {...filterProps} />
        </Space>
        <UserFilterChips {...filterProps} />
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
        dataSource={users}
        columns={columns as any}
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
            total={pagedUsers?.totalResults ?? 0}
          />
        )}
      />
    </div>
  );
};

export default List;
