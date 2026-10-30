import React, { type ReactNode } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useQuery } from '@apollo/client/react';
import {
  Button,
  Card,
  Empty,
  Progress,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { SyncOutlined, WarningOutlined } from '@ant-design/icons';

import type { SecurityServerUsageStatsQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import { message } from '/imports/ui/antd-feedback';

import { SECURITY_SERVER_USAGE_STATS } from '../gql';
import { formatDateTime } from '../common/format';
import useListScrollY from '../common/use-list-scroll-y';

const { Text } = Typography;

type Summary = NonNullable<
  SecurityServerUsageStatsQuery['securityServerUsageStats']
>;
type ServerUsage = NonNullable<Summary['server']>;
type ChannelUsage = NonNullable<NonNullable<Summary['channels']>[number]>;

// The security server sends a 5-minute bucket once it is complete, so polling
// faster gains nothing.
const POLL_INTERVAL_MS = 5 * 60_000;

// A bucket's start trails the push by 5-10 minutes; beyond this, the security
// server is down or can't reach the ERP.
const STALE_AFTER_MINUTES = 20;

// In minutes. Starts at 30 since the data comes in 5-minute buckets, and ends
// at the ERP's 30-day retention.
const DEFAULT_MINUTES = 60;
const RANGE_OPTIONS = [
  { label: 'Last 30 minutes', value: 30 },
  { label: 'Last hour', value: 60 },
  { label: 'Last 3 hours', value: 180 },
  { label: 'Last 12 hours', value: 720 },
  { label: 'Last 24 hours', value: 1440 },
  { label: 'Last 7 days', value: 10080 },
  { label: 'Last 30 days', value: 43200 },
];

// Beyond these, channels start losing frames that were due for recognition.
const INFERENCE_WARNING_PCT = 70;
const INFERENCE_ERROR_PCT = 90;
const BUSY_SKIP_WARNING_PCT = 5;

const withTooltip = (title: string, tooltip: string) => (
  <Tooltip title={tooltip}>
    <span>{title}</span>
  </Tooltip>
);

const Tile = ({
  title,
  tooltip,
  children,
  subtext,
}: {
  title: string;
  tooltip: string;
  children: ReactNode;
  subtext?: ReactNode;
}) => (
  <Card size="small" title={withTooltip(title, tooltip)}>
    {children}
    {subtext && (
      <div className="security-server-usage-tile-subtext">{subtext}</div>
    )}
  </Card>
);

const ServerTiles = ({ server }: { server: ServerUsage }) => {
  const inferencePct = server.inferenceBusyAvgPct ?? 0;
  const hasGpu = server.gpuUtilAvgPct != null;

  return (
    <div className="security-server-usage-tiles">
      <Tile
        title="Inference Lane"
        tooltip="Share of time spent in face detection and embedding. This runs on one thread and is the capacity that runs out first: near 100%, channels start dropping frames."
        subtext={`Peak ${server.inferenceBusyMaxPct ?? 0}% in one minute`}
      >
        <Statistic value={inferencePct} suffix="% busy" />
        <Progress
          percent={Math.min(inferencePct, 100)}
          status={inferencePct >= INFERENCE_ERROR_PCT ? 'exception' : 'normal'}
          strokeColor={
            inferencePct >= INFERENCE_WARNING_PCT &&
            inferencePct < INFERENCE_ERROR_PCT
              ? '#faad14'
              : undefined
          }
          showInfo={false}
        />
      </Tile>
      <Tile
        title="GPU"
        tooltip="Utilisation of the busiest GPU, sampled every few seconds from nvidia-smi."
        subtext={
          hasGpu
            ? `Peak ${server.gpuUtilMaxPct}% · ${server.gpuMemUsedMb ?? '-'} / ${server.gpuMemTotalMb ?? '-'} MiB`
            : `No GPU visible · inference on ${(server.dnnTarget ?? '').toUpperCase()}`
        }
      >
        <Statistic
          value={server.gpuUtilAvgPct ?? '-'}
          suffix={hasGpu ? '% util' : undefined}
        />
      </Tile>
      <Tile
        title="CPU"
        tooltip="Security server process CPU, mostly video decoding."
        subtext={`of ${server.cpuCores ?? '-'} cores`}
      >
        <Statistic
          value={((server.cpuAvgPct ?? 0) / 100).toFixed(1)}
          suffix="cores"
        />
      </Tile>
      <Tile
        title="Active Channels"
        tooltip="Channels that delivered at least one frame in the latest minute. Event-loop lag shows how long timers and requests were kept waiting."
        subtext={`Event-loop lag p95 ${server.eventLoopLagP95Ms ?? 0} ms · max ${server.eventLoopLagMaxMs ?? 0} ms`}
      >
        <Statistic value={server.activeChannels ?? 0} />
      </Tile>
    </div>
  );
};

/** When the newest usage stats from the security server are from. */
const LastData = ({ lastBucketAt }: { lastBucketAt?: string | null }) => {
  if (!lastBucketAt) {
    return (
      <Text type="secondary">Security server has not sent usage stats yet</Text>
    );
  }

  const minutesAgo = Math.floor((Date.now() - Number(lastBucketAt)) / 60_000);
  const label = `Data up to ${formatDateTime(lastBucketAt)}`;
  if (minutesAgo < STALE_AFTER_MINUTES) {
    return <Text type="secondary">{label}</Text>;
  }

  return (
    <Tooltip
      title={`No usage stats from the security server for ${minutesAgo} minutes. It is down or can't reach the ERP.`}
    >
      <Text type="warning">
        <WarningOutlined /> {label}
      </Text>
    </Tooltip>
  );
};

const numberSorter =
  (field: keyof ChannelUsage) => (a: ChannelUsage, b: ChannelUsage) =>
    Number(a[field] ?? 0) - Number(b[field] ?? 0);

const COLUMNS = [
  { title: 'Channel', dataIndex: 'name', width: 200 },
  {
    title: withTooltip(
      'Resolution',
      'Frame size as decoded, before downscaling. Decoding cost grows with frame size and read rate.'
    ),
    render: (_: unknown, record: ChannelUsage) =>
      record.frameWidth && record.frameHeight
        ? `${record.frameWidth}×${record.frameHeight}`
        : '-',
  },
  {
    title: withTooltip(
      'Read fps',
      'Frames read from the camera per second. All of them are decoded.'
    ),
    dataIndex: 'readFps',
    sorter: numberSorter('readFps'),
  },
  {
    title: withTooltip(
      'Processed fps',
      'Frames analysed per second, against the channel’s configured recognition rate.'
    ),
    dataIndex: 'processedFps',
    sorter: numberSorter('processedFps'),
    render: (value: number, record: ChannelUsage) =>
      `${value} / ${record.recognitionFps}`,
  },
  {
    title: withTooltip(
      'Busy Skip',
      'Frames due for recognition but dropped because the previous one was still processing. Above zero, the security server can’t keep up with this channel’s recognition rate.'
    ),
    dataIndex: 'busySkipPct',
    sorter: numberSorter('busySkipPct'),
    render: (value: number) =>
      value >= BUSY_SKIP_WARNING_PCT ? (
        <Tag color="error">{value}%</Tag>
      ) : (
        `${value}%`
      ),
  },
  {
    title: withTooltip(
      'Inference Share',
      'This channel’s share of the inference lane: the part of the server’s busy % it accounts for.'
    ),
    dataIndex: 'inferenceSharePct',
    defaultSortOrder: 'descend' as const,
    sorter: numberSorter('inferenceSharePct'),
    render: (value: number) => `${value}%`,
  },
  {
    title: withTooltip(
      'Faces',
      'Faces that passed the channel’s size and quality checks and were matched against profiles.'
    ),
    dataIndex: 'faces',
    sorter: numberSorter('faces'),
  },
  {
    title: withTooltip(
      'Faces Skipped',
      'Share of detected faces ignored as too small or too poor to match (see the channel’s min face size and quality). Near 100% means the camera is too far away or the minimums are too strict.'
    ),
    dataIndex: 'faceSkipPct',
    sorter: numberSorter('faceSkipPct'),
    render: (value: number, record: ChannelUsage) => (
      <Tooltip
        title={`${record.skippedFaceSize} too small, ${record.skippedFaceQuality} too poor`}
      >
        {value}%
      </Tooltip>
    ),
  },
  {
    title: withTooltip(
      'Read Failures',
      'Empty or failed frame reads from the camera stream.'
    ),
    dataIndex: 'readFailures',
    sorter: numberSorter('readFailures'),
  },
  {
    title: 'Reconnects',
    dataIndex: 'reconnects',
    sorter: numberSorter('reconnects'),
    render: (value: number) =>
      value > 0 ? <Tag color="warning">{value}</Tag> : value,
  },
];

type Props = RouteComponentProps;

const Usage = ({ history, location }: Props) => {
  useBreadcrumbs(['Security', 'Security Server', 'Usage']);
  const { containerRef, scrollY } = useListScrollY();

  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['minutes'],
    paramDefaultValues: { minutes: DEFAULT_MINUTES },
  });
  const requested = toSafeInteger(queryParams.minutes);
  const minutes = RANGE_OPTIONS.some(option => option.value === requested)
    ? requested
    : DEFAULT_MINUTES;

  const { data, loading, refetch } = useQuery(SECURITY_SERVER_USAGE_STATS, {
    variables: { minutes },
    pollInterval: POLL_INTERVAL_MS,
  });

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const summary = data?.securityServerUsageStats;
  const channels = (summary?.channels ?? []).filter(
    (row): row is ChannelUsage => row != null
  );

  const handleRefresh = () =>
    refetch().then(() => {
      message.success('Data Reloaded', 2);
    });

  const getTableHeader = () => (
    <div className="list-table-header">
      <div className="list-table-header-section">
        <LastData lastBucketAt={summary?.lastBucketAt} />
      </div>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Select
            options={RANGE_OPTIONS}
            value={minutes}
            onChange={value => setPageParams({ minutes: value })}
            style={{ width: 160 }}
          />
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            title="Reload Data"
          />
        </Space>
      </div>
    </div>
  );

  return (
    <div className="list-container" ref={containerRef}>
      {summary?.server && <ServerTiles server={summary.server} />}
      <Table<ChannelUsage>
        className="list-table"
        bordered
        size="middle"
        tableLayout="fixed"
        rowKey="channelId"
        loading={loading}
        title={getTableHeader}
        dataSource={channels}
        columns={COLUMNS}
        pagination={false}
        scroll={{ y: scrollY }}
        locale={{
          emptyText: (
            <Empty description="No usage stats received for this range" />
          ),
        }}
      />
    </div>
  );
};

export default Usage;
