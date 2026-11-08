import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import {
  Button,
  DatePicker,
  Empty,
  Flex,
  Image,
  Pagination,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from 'antd';
import { SyncOutlined } from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/list-options';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import type { WorkspaceMonitoringAlertsQuery } from 'meteor/idreesia-common/types/client-operations';
import { message } from '/imports/ui/antd-feedback';
import ReviewTag from '/imports/ui/modules/security/security-server/common/review-tag';
import {
  formatDateTime,
  formatScore,
} from '/imports/ui/modules/security/security-server/common/format';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import { WORKSPACE_MONITORING_ALERTS } from './gql';

type Alert = NonNullable<
  NonNullable<
    NonNullable<WorkspaceMonitoringAlertsQuery['workspaceMonitoringAlerts']>['data']
  >[number]
>;

const PARAM_NAMES = ['date', 'pageIndex', 'pageSize'] as const;

/**
 * Workspaces → committee → Monitoring Alerts: the security server's
 * face-match alerts for one day (today by default), newest first, read-only.
 */
const Report = ({ history, location }: RouteComponentProps) => {
  const { committeeId } = useParams<{ committeeId: string }>();
  // Fixed for the life of the page, so it doesn't jump at midnight.
  const [today] = useState(() => dayjs().format(Formats.DATE_FORMAT));
  const { containerRef, scrollY } = useListScrollY();

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: [...PARAM_NAMES],
    paramDefaultValues: {
      date: today,
      pageIndex: DEFAULT_PAGE_INDEX,
      pageSize: DEFAULT_PAGE_SIZE,
    },
  });

  const param = (name: (typeof PARAM_NAMES)[number]) => {
    const value = queryParams[name];
    return typeof value === 'string' && value !== '' ? value : undefined;
  };

  const date = param('date') ?? today;
  const pageIndex = Number(param('pageIndex') ?? DEFAULT_PAGE_INDEX);
  const pageSize = Number(param('pageSize') ?? DEFAULT_PAGE_SIZE);

  const { data, loading, error, refetch } = useQuery(WORKSPACE_MONITORING_ALERTS, {
    variables: {
      committeeId: committeeId!,
      date,
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
    },
    skip: !committeeId,
    fetchPolicy: 'cache-and-network',
  });

  if (loading && !data) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Spin />
      </Flex>
    );
  }

  if (error && !data) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        <Empty description={error.message} />
      </Flex>
    );
  }

  const paged = data?.workspaceMonitoringAlerts;
  const alerts = (paged?.data ?? []).filter(
    (alert): alert is Alert => alert != null && alert._id != null
  );

  const handleRefresh = () => {
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const columns = [
    {
      title: 'Snapshot',
      key: 'snapshot',
      width: 140,
      render: (_: unknown, alert: Alert) => {
        // Older alerts may have no thumbnail; the preview shows the full image.
        const src = alert.thumbnailUrl || alert.imageUrl;
        return src ? (
          <Image
            className="security-server-alert-thumb"
            src={src}
            alt="Alert snapshot"
            preview={alert.imageUrl ? { src: alert.imageUrl } : false}
          />
        ) : null;
      },
    },
    {
      title: 'Time',
      key: 'timestamp',
      width: 190,
      render: (_: unknown, alert: Alert) => formatDateTime(alert.timestamp),
    },
    {
      title: 'Profile',
      key: 'profileName',
      render: (_: unknown, alert: Alert) => (
        <>
          {alert.profileName}
          {alert.profileIsTest ? (
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
      key: 'similarityScore',
      width: 100,
      render: (_: unknown, alert: Alert) => formatScore(alert.similarityScore),
    },
    {
      title: 'Review',
      key: 'review',
      width: 140,
      render: (_: unknown, alert: Alert) => <ReviewTag review={alert.review} />,
    },
  ];

  const dayLabel = dayjs(date, Formats.DATE_FORMAT).format('ddd, DD MMM YYYY');

  return (
    <div className="list-container" ref={containerRef}>
      <Table
        className="list-table"
        rowKey="_id"
        dataSource={alerts}
        columns={columns}
        loading={loading}
        bordered
        size="middle"
        tableLayout="fixed"
        pagination={false}
        scroll={{ y: scrollY }}
        title={() => (
          <div className="list-table-header">
            <Typography.Text strong>Alerts on {dayLabel}</Typography.Text>
            <div className="list-table-header-utilities">
              <Space size={8}>
                <DatePicker
                  allowClear={false}
                  format={Formats.DATE_FORMAT}
                  value={dayjs(date, Formats.DATE_FORMAT)}
                  onChange={(value) => {
                    if (!value) return;
                    setPageParams({
                      date: value.format(Formats.DATE_FORMAT),
                      pageIndex: 0,
                    });
                  }}
                />
                <Button
                  icon={<SyncOutlined />}
                  onClick={handleRefresh}
                  title="Reload Data"
                />
              </Space>
            </div>
          </div>
        )}
        footer={() => (
          <Pagination
            current={pageIndex + 1}
            pageSize={pageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={(page, size) =>
              setPageParams({ pageIndex: page - 1, pageSize: size })
            }
            total={paged?.totalResults ?? 0}
          />
        )}
      />
    </div>
  );
};

export default Report;
