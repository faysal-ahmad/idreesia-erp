import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Image, Pagination, Table, Tag } from 'antd';
import type { PagedSecurityServerAlertGroupsQuery } from 'meteor/idreesia-common/types/client-operations';

import { PAGED_SECURITY_SERVER_ALERTS } from '../../gql';
import AlertsTable, { type AlertRow } from '../../common/alerts-table';
import { formatDateTime } from '../../common/format';
import type { AlertFilterParams } from './list-filter';

export type AlertGroupRow = NonNullable<
  NonNullable<
    NonNullable<
      PagedSecurityServerAlertGroupsQuery['pagedSecurityServerAlertGroups']
    >['data']
  >[number]
>;

const GROUP_ALERTS_PAGE_SIZE = 10;

interface GroupAlertsProps {
  profileId: string;
  filterParams: AlertFilterParams;
  onAlertClick(row: AlertRow): void;
}

// One person's alerts under the same filters as the groups, paged on its own.
const GroupAlerts = ({
  profileId,
  filterParams,
  onAlertClick,
}: GroupAlertsProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(GROUP_ALERTS_PAGE_SIZE);
  const { data, loading } = useQuery(PAGED_SECURITY_SERVER_ALERTS, {
    variables: {
      filter: {
        ...filterParams,
        profileId,
        pageIndex: String(pageIndex),
        pageSize: String(pageSize),
      },
    },
  });
  const pagedAlerts = data?.pagedSecurityServerAlerts;
  const rows = (pagedAlerts?.data ?? []).filter(
    (row): row is AlertRow => row != null
  );

  return (
    <AlertsTable
      rows={rows}
      totalResults={pagedAlerts?.totalResults ?? 0}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPageChange={(nextPageIndex, nextPageSize) => {
        setPageIndex(nextPageIndex);
        setPageSize(nextPageSize);
      }}
      onRowClick={onAlertClick}
      loading={loading}
      hideProfile
    />
  );
};

interface Props {
  rows: AlertGroupRow[];
  totalResults: number;
  pageIndex: number;
  pageSize: number;
  onPageChange(pageIndex: number, pageSize: number): void;
  onAlertClick(row: AlertRow): void;
  filterParams: AlertFilterParams;
  loading?: boolean;
  title?: () => React.ReactNode;
  scrollY?: number;
}

const AlertGroupsTable = ({
  rows,
  totalResults,
  pageIndex,
  pageSize,
  onPageChange,
  onAlertClick,
  filterParams,
  loading,
  title,
  scrollY,
}: Props) => {
  const columns = [
    {
      title: 'Latest Snapshot',
      key: 'snapshot',
      width: 140,
      render: (_text: unknown, record: AlertGroupRow) =>
        record.latestImageUrl ? (
          <Image
            className="security-server-alert-thumb"
            src={record.latestImageUrl}
            alt="Latest alert snapshot"
            preview={false}
          />
        ) : null,
    },
    {
      title: 'Person',
      key: 'profileName',
      render: (_text: unknown, record: AlertGroupRow) => (
        <>
          {record.profileName}
          {record.profileIsTest ? (
            <Tag className="security-server-inline-tag">Test</Tag>
          ) : null}
        </>
      ),
    },
    {
      title: 'Alerts',
      dataIndex: 'alertCount',
      key: 'alertCount',
      width: 100,
    },
    {
      title: 'Not Reviewed',
      dataIndex: 'notReviewedCount',
      key: 'notReviewedCount',
      width: 130,
    },
    {
      title: 'First Seen',
      dataIndex: 'firstTimestamp',
      key: 'firstTimestamp',
      width: 190,
      render: (text: string | null) => formatDateTime(text),
    },
    {
      title: 'Last Seen',
      dataIndex: 'lastTimestamp',
      key: 'lastTimestamp',
      width: 190,
      render: (text: string | null) => formatDateTime(text),
    },
  ];

  return (
    <Table
      className="list-table"
      rowKey="profileId"
      dataSource={rows}
      columns={columns}
      expandable={{
        expandRowByClick: true,
        expandedRowRender: record =>
          record.profileId ? (
            <GroupAlerts
              profileId={record.profileId}
              filterParams={filterParams}
              onAlertClick={onAlertClick}
            />
          ) : null,
      }}
      onRow={() => ({ style: { cursor: 'pointer' } })}
      loading={loading}
      title={title}
      size="middle"
      bordered
      tableLayout="fixed"
      pagination={false}
      scroll={scrollY ? { y: scrollY } : undefined}
      footer={() => (
        <Pagination
          current={pageIndex + 1}
          pageSize={pageSize}
          showSizeChanger
          showTotal={(total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} of ${total} people`
          }
          onChange={(page, size) => onPageChange(page - 1, size)}
          total={totalResults}
        />
      )}
    />
  );
};

export default AlertGroupsTable;
