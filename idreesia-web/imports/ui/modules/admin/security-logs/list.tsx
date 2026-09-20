import React, { useEffect, useRef, useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { Pagination, Space, Spin, Table } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { SecurityOperationTypeDisplayName } from 'meteor/idreesia-common/constants/audit';
import { useBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { message } from '/imports/ui/antd-feedback';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import type { PagedSecurityLogsQuery } from 'meteor/idreesia-common/types/client-operations';

import { PAGED_SECURITY_LOGS, SECURITY_LOG_USERS } from './gql';
import ListFilter, { SecurityLogsListFilterChips } from './list-filter';

const TABLE_HEADER_ROW_HEIGHT = 55;
const VIEWPORT_BOTTOM_GAP = 16;

type SecurityLogRow = NonNullable<
  NonNullable<NonNullable<PagedSecurityLogsQuery['pagedSecurityLogs']>['data']>[number]
>;

const renderOperationDetails = (operationDetails: unknown): React.ReactNode => {
  if (!operationDetails || typeof operationDetails !== 'object') return null;

  const entries = Object.entries(operationDetails as Record<string, unknown>);
  if (entries.length === 0) return null;

  return (
    <ul>
      {entries.map(([key, value]) => (
        <li key={key}>{`${key}: ${JSON.stringify(value)}`}</li>
      ))}
    </ul>
  );
};

const parseTimeBetween = (value?: string) => {
  if (!value) return [undefined, undefined] as [string | undefined, string | undefined];
  try {
    const [start, end] = JSON.parse(value);
    return [start || undefined, end || undefined] as [
      string | undefined,
      string | undefined,
    ];
  } catch {
    return [undefined, undefined] as [string | undefined, string | undefined];
  }
};

const columns = [
  {
    title: 'Operation',
    dataIndex: 'operationType',
    key: 'operationType',
    width: 160,
    render: (operationType: string | null) =>
      (operationType && SecurityOperationTypeDisplayName[operationType]) ||
      operationType,
  },
  {
    title: 'User',
    key: 'user',
    render: (_text: unknown, record: SecurityLogRow) => (
      <PersonName
        person={{
          _id: record.userId,
          name: record.userName,
          imageId: record.userImageId,
          imageThumbnailId: record.userImageThumbnailId,
        }}
      />
    ),
  },
  {
    title: 'Time',
    dataIndex: 'operationTime',
    key: 'operationTime',
    width: 110,
    render: (text: string | null) => {
      if (!text) return '';
      const date = dayjs(Number(text));
      return (
        <span>
          {date.format(Formats.DATE_FORMAT)}
          <br />
          {date.format(Formats.TIME_FORMAT)}
        </span>
      );
    },
  },
  {
    title: 'Performed By',
    key: 'operationBy',
    render: (_text: unknown, record: SecurityLogRow) => (
      <PersonName
        person={{
          _id: record.operationBy,
          name: record.operationByName,
          imageId: record.operationByImageId,
          imageThumbnailId: record.operationByImageThumbnailId,
        }}
      />
    ),
  },
  {
    title: 'Source',
    key: 'dataSource',
    width: 120,
    render: (_text: unknown, record: SecurityLogRow) => (
      <span>
        {record.dataSource}
        {record.dataSourceDetail ? (
          <>
            <br />
            {record.dataSourceDetail}
          </>
        ) : null}
      </span>
    ),
  },
  {
    title: 'Details',
    dataIndex: 'operationDetails',
    key: 'operationDetails',
    render: renderOperationDetails,
  },
];

type Props = RouteComponentProps;

const List = ({ history, location }: Props) => {
  useBreadcrumbs(['Admin', 'Access Management', 'Security Logs']);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(360);

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [
      'dataSource',
      'operationType',
      'userId',
      'operationTimeBetween',
      'pageIndex',
      'pageSize',
    ],
  });

  const {
    dataSource,
    operationType,
    userId,
    operationTimeBetween,
    pageIndex,
    pageSize,
  } = queryParams;

  const [startTime, endTime] = parseTimeBetween(
    operationTimeBetween as string | undefined
  );

  const { data, loading, refetch } = useQuery(PAGED_SECURITY_LOGS, {
    variables: {
      filter: {
        dataSource: dataSource as string | undefined,
        operationType: operationType as string | undefined,
        userId: userId as string | undefined,
        startTime,
        endTime,
        pageIndex: pageIndex as string | undefined,
        pageSize: pageSize as string | undefined,
      },
    },
  });

  const { data: selectedUserData } = useQuery(SECURITY_LOG_USERS, {
    variables: { ids: userId ? [userId as string] : [] },
    skip: !userId,
  });
  const selectedUserName = selectedUserData?.securityLogUsers?.[0]?.name ?? null;

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

      setScrollY((prev) => (Math.abs(nextScrollY - prev) > 2 ? nextScrollY : prev));
    });
  };

  useEffect(() => {
    updateScrollY();
    window.addEventListener('resize', updateScrollY);
    return () => window.removeEventListener('resize', updateScrollY);
  });

  const handleFilterSetPageParams = (params: {
    pageIndex: number;
    dataSource?: string;
    operationType?: string;
    userId?: string;
    operationTimeBetween?: string;
  }) => {
    setPageParams(params);
  };

  const handleRefresh = () =>
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });

  const onPaginationChange = (page: number, nextPageSize?: number) => {
    setPageParams({
      pageIndex: page - 1,
      pageSize: nextPageSize,
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const pagedSecurityLogs = data?.pagedSecurityLogs ?? {
    data: [],
    totalResults: 0,
  };
  const rows = (pagedSecurityLogs.data ?? []).filter(
    (row): row is SecurityLogRow => row != null
  );
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const filterProps = {
    dataSource: dataSource as string | undefined,
    operationType: operationType as string | undefined,
    userId: userId as string | undefined,
    operationTimeBetween: operationTimeBetween as string | undefined,
    selectedUserName,
    setPageParams: handleFilterSetPageParams,
    refreshData: handleRefresh,
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section" />
      <div className="list-table-header-utilities">
        <Space size={8}>
          <ListFilter {...filterProps} />
        </Space>
        <SecurityLogsListFilterChips {...filterProps} />
      </div>
    </div>
  );

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={rows}
        columns={columns}
        title={getTableHeader}
        size="middle"
        bordered
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
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
            total={pagedSecurityLogs.totalResults ?? 0}
          />
        )}
      />
    </div>
  );
};

export default List;
