import React from 'react';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@apollo/client/react';
import { type History } from 'history';
import { Alert, Button, Pagination, Popconfirm, Progress, Space, Spin, Table, Tag } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import type { PagedScheduledJobsQuery } from 'meteor/idreesia-common/types/client-operations';

import ListFilter, { JobsFilterChips } from './list-filter';
import {
  PAGED_SCHEDULED_JOBS,
  RETRY_FAILED_JOB,
  SET_SCHEDULED_JOB_ENABLED,
  IS_JOB_PROCESSOR_ACTIVE,
} from '../gql';

type JobRow = NonNullable<
  NonNullable<NonNullable<PagedScheduledJobsQuery['pagedScheduledJobs']>['data']>[number]
>;

const StatusColors: Record<string, string> = {
  scheduled: 'blue',
  running: 'processing',
  queued: 'default',
  completed: 'green',
  failed: 'red',
  repeating: 'purple',
  paused: 'default',
};

const ProgressStatuses: Record<string, 'exception' | 'active' | 'normal'> = {
  failed: 'exception',
  running: 'active',
};
const getProgressStatus = (status: string) => ProgressStatuses[status] ?? 'normal';

// nextRunAt/lastRunAt/lastFinishedAt arrive as ISO-8601 UTC strings (the
// DateTime scalar) - dayjs parses that and formats in the browser's local
// timezone by default, same convention as audit-info.tsx.
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
  useBreadcrumbs(['Admin', 'Scheduled Jobs', 'Jobs Dashboard']);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['name', 'status', 'pageIndex', 'pageSize'],
  });

  const { data, loading, refetch } = useQuery(PAGED_SCHEDULED_JOBS, {
    variables: { filter: queryParams },
  });
  const { data: processorStatusData } = useQuery(IS_JOB_PROCESSOR_ACTIVE, {
    fetchPolicy: 'network-only',
  });

  const [retryFailedJob] = useMutation(RETRY_FAILED_JOB);
  const [setScheduledJobEnabled] = useMutation(SET_SCHEDULED_JOB_ENABLED);

  const handleRetryClicked = (record: JobRow) => {
    retryFailedJob({ variables: { _id: record._id as string } })
      .then(() => {
        message.success('Job has been retried.', 5);
        refetch();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleToggleEnabledClicked = (record: JobRow) => {
    setScheduledJobEnabled({
      variables: { _id: record._id as string, enabled: !!record.disabled },
    })
      .then(() => {
        refetch();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleRefresh = async () => {
    await refetch();
  };

  const onPaginationChange = (pageIndex: number, pageSize?: number) => {
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize: pageSize ?? 20,
    });
  };

  const { name, status, pageIndex, pageSize } = queryParams;

  const handleFilterSetPageParams = (params: {
    pageIndex?: string | number;
    name?: string;
    status?: string;
  }) => {
    setPageParams(params);
  };

  const filterProps = {
    name: typeof name === 'string' ? name : undefined,
    status: typeof status === 'string' ? status : undefined,
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
        <JobsFilterChips {...filterProps} />
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

  const pagedScheduledJobs = data?.pagedScheduledJobs;
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  const jobRows: JobRow[] = (pagedScheduledJobs?.data ?? []).filter(
    (row): row is JobRow => row != null && row._id != null
  );

  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (statusValue: string) => (
        <Tag color={StatusColors[statusValue]}>{statusValue}</Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      width: 150,
      render: (progress: number | null | undefined, record: JobRow) =>
        progress == null ? (
          '-'
        ) : (
          <Progress
            percent={progress}
            size="small"
            status={getProgressStatus(record.status ?? '')}
          />
        ),
    },
    {
      title: 'Next Run At',
      dataIndex: 'nextRunAt',
      key: 'nextRunAt',
      width: 200,
      render: formatTimestamp,
    },
    {
      title: 'Last Run At',
      dataIndex: 'lastRunAt',
      key: 'lastRunAt',
      width: 200,
      render: formatTimestamp,
    },
    {
      title: 'Last Finished At',
      dataIndex: 'lastFinishedAt',
      key: 'lastFinishedAt',
      width: 200,
      render: formatTimestamp,
    },
    {
      title: 'Fail Reason',
      dataIndex: 'failReason',
      key: 'failReason',
      render: (failReason: string, record: JobRow) =>
        record.status === 'failed' ? failReason : null,
    },
    {
      title: 'Fail Count',
      dataIndex: 'failCount',
      key: 'failCount',
      width: 100,
    },
    {
      key: 'action',
      width: 170,
      render: (_text: unknown, record: JobRow) => (
        <div className="list-actions-column">
          {record.status === 'failed' && (
            <Popconfirm
              title="Retry this job now?"
              onConfirm={() => handleRetryClicked(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" style={{ marginRight: 8 }}>
                Retry
              </Button>
            </Popconfirm>
          )}
          {record.repeatInterval && (
            <Popconfirm
              title={
                record.disabled
                  ? 'Enable this recurring job?'
                  : 'Disable this recurring job?'
              }
              onConfirm={() => handleToggleEnabledClicked(record)}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small">{record.disabled ? 'Enable' : 'Disable'}</Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="list-container">
      {processorStatusData?.isJobProcessorActive === false ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message="Job processing is disabled"
          description={
            'Meteor.settings.private.jobs.enabled is off on this server, so scheduled and queued jobs will not run - including anything triggered from "Retry" below or "Run Now" on the Job Definitions page. Enable it and restart the server.'
          }
        />
      ) : null}
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={jobRows}
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
            total={pagedScheduledJobs?.totalResults ?? 0}
          />
        )}
      />
    </div>
  );
};

export default List;
