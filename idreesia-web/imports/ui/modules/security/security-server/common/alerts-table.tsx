import React from 'react';
import { Link } from 'react-router-dom';
import { Image, Pagination, Table, Tag } from 'antd';
import type { PagedSecurityServerAlertsQuery } from 'meteor/idreesia-common/types/client-operations';

import paths from '../../submodule-paths';

import ReviewTag from './review-tag';
import { formatDateTime, formatScore } from './format';

export type AlertRow = NonNullable<
  NonNullable<
    NonNullable<
      PagedSecurityServerAlertsQuery['pagedSecurityServerAlerts']
    >['data']
  >[number]
>;

interface Props {
  rows: AlertRow[];
  totalResults: number;
  pageIndex: number;
  pageSize: number;
  onPageChange(pageIndex: number, pageSize: number): void;
  onRowClick(row: AlertRow): void;
  loading?: boolean;
  title?: () => React.ReactNode;
  scrollY?: number;
  // Within one person's group the Profile column would repeat on every row.
  hideProfile?: boolean;
}

const AlertsTable = ({
  rows,
  totalResults,
  pageIndex,
  pageSize,
  onPageChange,
  onRowClick,
  loading,
  title,
  scrollY,
  hideProfile,
}: Props) => {
  const columns = [
    {
      title: 'Snapshot',
      key: 'snapshot',
      width: 140,
      render: (_text: unknown, record: AlertRow) =>
        record.imageUrl ? (
          <Image
            className="security-server-alert-thumb"
            src={record.imageUrl}
            alt="Alert snapshot"
            preview={false}
          />
        ) : null,
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 190,
      render: (text: string | null) => formatDateTime(text),
    },
    {
      title: 'Profile',
      key: 'profileName',
      render: (_text: unknown, record: AlertRow) => (
        <>
          <Link
            to={`${paths.securityServerAlertsPath}?profileId=${record.profileId}`}
            onClick={event => event.stopPropagation()}
          >
            {record.profileName}
          </Link>
          {record.profileIsTest ? (
            <Tag className="security-server-inline-tag">Test</Tag>
          ) : null}
        </>
      ),
    },
    {
      title: 'Channel',
      dataIndex: 'channelName',
      key: 'channelName',
    },
    {
      title: 'Score',
      dataIndex: 'similarityScore',
      key: 'similarityScore',
      width: 100,
      render: (score: number | null) => formatScore(score),
    },
    {
      title: 'Review',
      dataIndex: 'review',
      key: 'review',
      width: 140,
      render: (review: string | null) => <ReviewTag review={review} />,
    },
  ];

  return (
    <Table
      className="list-table"
      rowKey="_id"
      dataSource={rows}
      columns={
        hideProfile
          ? columns.filter(column => column.key !== 'profileName')
          : columns
      }
      onRow={record => ({
        onClick: () => onRowClick(record),
        style: { cursor: 'pointer' },
      })}
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
            `${range[0]}-${range[1]} of ${total} items`
          }
          onChange={(page, size) => onPageChange(page - 1, size)}
          total={totalResults}
        />
      )}
    />
  );
};

export default AlertsTable;
