import React from 'react';
import dayjs from 'dayjs';
import { useQuery } from '@apollo/client/react';
import { type History } from 'history';
import { Pagination, Space, Spin, Table, Tag } from 'antd';
import { useBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import type { PagedJobLogsQuery } from 'meteor/idreesia-common/types/client-operations';

import ListFilter, { JobLogsFilterChips } from './list-filter';
import { PAGED_JOB_LOGS } from '../gql';

type JobLogRow = NonNullable<
  NonNullable<NonNullable<PagedJobLogsQuery['pagedJobLogs']>['data']>[number]
>;

const LevelColors: Record<string, string> = {
  info: 'blue',
  warn: 'orange',
  error: 'red',
  debug: 'default',
};

// timestamp arrives as an ISO-8601 UTC string (the DateTime scalar) - dayjs
// parses that and formats in the browser's local timezone by default, same
// convention as the Jobs Dashboard and audit-info.tsx.
const formatTimestamp = (value?: string | null) =>
  value ? dayjs(value).format(Formats.DATE_TIME_FORMAT) : null;

interface ListProps {
  history: History;
  location: {
    pathname: string;
    search: string;
  };
}

const List = ({ history, location }: ListProps) => {
  useBreadcrumbs(['Admin', 'Scheduled Jobs', 'Job Logs']);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['jobName', 'level', 'event', 'pageIndex', 'pageSize'],
  });

  const { data, loading, refetch } = useQuery(PAGED_JOB_LOGS, {
    variables: { filter: queryParams },
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const onPaginationChange = (pageIndex: number, pageSize?: number) => {
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize: pageSize ?? 20,
    });
  };

  const { jobName, level, event, pageIndex, pageSize } = queryParams;

  const handleFilterSetPageParams = (params: {
    pageIndex?: string | number;
    jobName?: string;
    level?: string;
    event?: string;
  }) => {
    setPageParams(params);
  };

  const filterProps = {
    jobName: typeof jobName === 'string' ? jobName : undefined,
    level: typeof level === 'string' ? level : undefined,
    event: typeof event === 'string' ? event : undefined,
    setPageParams: handleFilterSetPageParams,
    refreshData: handleRefresh,
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div />
      <div className="list-table-header-utilities">
        <Space size={8}>
          <ListFilter {...filterProps} />
        </Space>
        <JobLogsFilterChips {...filterProps} />
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

  const pagedJobLogs = data?.pagedJobLogs;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const logRows: JobLogRow[] = (pagedJobLogs?.data ?? []).filter(
    (row): row is JobLogRow => row != null
  );

  const columns: any[] = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 200,
      render: formatTimestamp,
    },
    {
      title: 'Job Name',
      dataIndex: 'jobName',
      key: 'jobName',
      width: 220,
    },
    {
      title: 'Event',
      dataIndex: 'event',
      key: 'event',
      width: 130,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (levelValue: string) => (
        <Tag color={LevelColors[levelValue]}>{levelValue}</Tag>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Duration (ms)',
      dataIndex: 'duration',
      key: 'duration',
      width: 110,
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
    },
    {
      title: 'Fail Count',
      dataIndex: 'failCount',
      key: 'failCount',
      width: 100,
    },
    {
      title: 'Retry Attempt',
      dataIndex: 'retryAttempt',
      key: 'retryAttempt',
      width: 110,
    },
  ];

  return (
    <div className="list-container">
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={logRows}
        columns={columns}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        title={getTableHeader}
        footer={() => (
          <Pagination
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total: number, range: [number, number]) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={onPaginationChange}
            onShowSizeChange={onPaginationChange}
            total={pagedJobLogs?.totalResults ?? 0}
          />
        )}
      />
    </div>
  );
};

export default List;
