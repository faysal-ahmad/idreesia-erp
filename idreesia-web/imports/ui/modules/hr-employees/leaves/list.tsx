import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import dayjs, { type Dayjs } from 'dayjs';
import { useQuery } from '@apollo/client/react';
import {
  FilterOutlined,
  PlusCircleOutlined,
  SyncOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  DatePicker,
  Flex,
  Form,
  Pagination,
  Popover,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  useBreadcrumbs,
  useQueryParams,
} from 'meteor/idreesia-common/hooks/common';
import {
  LEAVE_REQUEST_STATUSES,
  LeaveRequestStatusNames,
  type LeaveRequestStatusValue,
} from 'meteor/idreesia-common/constants/hr/employment';
import type { PagedLeaveRequestsQuery } from 'meteor/idreesia-common/types/client-operations';
import { HrEmployeesSubModulePaths as paths } from '/imports/ui/modules/hr-employees';
import { PersonName } from '/imports/ui/modules/helpers/controls';
import useListScrollY from '/imports/ui/modules/security/security-server/common/use-list-scroll-y';

import { ALL_LEAVE_TYPES, PAGED_LEAVE_REQUESTS } from './gql';
import NewLeaveRequestModal from './new-request-modal';
import { formatLeaveDates, LEAVE_STATUS_COLORS } from './leave-display';

type LeaveRow = NonNullable<
  NonNullable<
    NonNullable<PagedLeaveRequestsQuery['pagedLeaveRequests']>['data']
  >[number]
>;

interface FilterFormValues {
  status?: string;
  leaveTypeId?: string;
  dates?: [Dayjs, Dayjs] | null;
}

const PARAM_NAMES = [
  'status',
  'leaveTypeId',
  'fromDate',
  'toDate',
  'pageIndex',
  'pageSize',
];

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

/** HR → Leaves: every leave request, newest first. */
const LeavesList = ({ history, location }: RouteComponentProps) => {
  useBreadcrumbs(['HR - Employees', 'Leaves']);
  const { containerRef, scrollY } = useListScrollY();
  const [filterForm] = Form.useForm<FilterFormValues>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: PARAM_NAMES,
    // Pending requests first: that's what HR acts on.
    paramDefaultValues: { status: 'submitted' },
  });

  const status = String(queryParams.status ?? '');
  const leaveTypeId = String(queryParams.leaveTypeId ?? '');
  const fromDate = String(queryParams.fromDate ?? '');
  const toDate = String(queryParams.toDate ?? '');
  const pageIndex = Number(queryParams.pageIndex ?? 0) || 0;
  const pageSize = Number(queryParams.pageSize ?? 20) || 20;

  const { data: typesData } = useQuery(ALL_LEAVE_TYPES);
  const { data, loading, refetch } = useQuery(PAGED_LEAVE_REQUESTS, {
    variables: {
      statuses: status && status !== 'all' ? [status] : null,
      leaveTypeId: leaveTypeId || null,
      fromDate: fromDate || null,
      toDate: toDate || null,
      pageIndex: String(pageIndex),
      pageSize: String(pageSize),
    },
  });

  const leaveTypes = (typesData?.allLeaveTypes ?? []).filter(type => type?._id);
  const leaveTypeName = (id: string) =>
    leaveTypes.find(type => type?._id === id)?.name ?? id;

  const chips: Array<{ key: string; label: string; clear: Record<string, string> }> = [];
  if (status && status !== 'all') {
    chips.push({
      key: 'status',
      label: `Status: ${LeaveRequestStatusNames[status as LeaveRequestStatusValue] ?? status}`,
      clear: { status: 'all' },
    });
  }
  if (leaveTypeId) {
    chips.push({
      key: 'leaveTypeId',
      label: `Type: ${leaveTypeName(leaveTypeId)}`,
      clear: { leaveTypeId: '' },
    });
  }
  if (fromDate || toDate) {
    chips.push({
      key: 'dates',
      label: `Dates: ${fromDate || '…'} to ${toDate || '…'}`,
      clear: { fromDate: '', toDate: '' },
    });
  }

  const openFilter = (nextOpen: boolean) => {
    if (nextOpen) {
      filterForm.setFieldsValue({
        status: status || 'all',
        leaveTypeId: leaveTypeId || undefined,
        dates:
          fromDate && toDate ? [dayjs(fromDate), dayjs(toDate)] : null,
      });
    }
    setFilterOpen(nextOpen);
  };

  const handleFilter = (values: FilterFormValues) => {
    setPageParams({
      pageIndex: 0,
      status: values.status || 'all',
      leaveTypeId: values.leaveTypeId || '',
      fromDate: values.dates?.[0]?.format('YYYY-MM-DD') ?? '',
      toDate: values.dates?.[1]?.format('YYYY-MM-DD') ?? '',
    });
    setFilterOpen(false);
  };

  const handleRefresh = () => {
    refetch().then(() => message.success('Data Reloaded', 2));
  };

  const rows = (data?.pagedLeaveRequests?.data ?? []).filter(
    (row): row is LeaveRow => !!row?._id
  );

  const columns = [
    {
      title: 'Employee',
      key: 'person',
      render: (_t: unknown, record: LeaveRow) =>
        record.person?._id ? (
          <PersonName
            person={{
              _id: record.person._id,
              name: record.person.sharedData?.name ?? '',
              imageUrl: record.person.sharedData?.imageUrl ?? undefined,
              imageThumbnailUrl:
                record.person.sharedData?.imageThumbnailUrl ?? undefined,
            }}
            onPersonNameClicked={() =>
              history.push(paths.leaveRequestPath(record._id as string))
            }
          />
        ) : null,
    },
    {
      title: 'Type',
      key: 'leaveType',
      width: 120,
      render: (_t: unknown, record: LeaveRow) => record.leaveType?.name,
    },
    {
      title: 'Dates',
      key: 'dates',
      width: 230,
      render: (_t: unknown, record: LeaveRow) => (
        <Link to={paths.leaveRequestPath(record._id as string)}>
          {formatLeaveDates(record)}
        </Link>
      ),
    },
    {
      title: 'Days',
      dataIndex: 'days',
      key: 'days',
      width: 80,
      render: (days: number, record: LeaveRow) => (
        <Space size={4}>
          {days}
          {record.balanceWarning ? (
            <Tooltip title={record.balanceWarning}>
              <WarningOutlined style={{ color: '#d97706' }} />
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_t: unknown, record: LeaveRow) => (
        <Tag color={LEAVE_STATUS_COLORS[record.status as LeaveRequestStatusValue]}>
          {LeaveRequestStatusNames[record.status as LeaveRequestStatusValue] ??
            record.status}
        </Tag>
      ),
    },
    {
      title: 'Checked With',
      key: 'confirmedWith',
      width: 170,
      render: (_t: unknown, record: LeaveRow) =>
        record.confirmedWith?.sharedData?.name ?? '',
    },
  ];

  const filterPanel = (
    <div className="list-filter-panel" style={{ width: 520 }}>
      <Form
        form={filterForm}
        layout="horizontal"
        style={{ width: '100%' }}
        onFinish={handleFilter}
      >
        <Form.Item name="status" label="Status" {...formItemLayout}>
          <Select
            options={[
              { value: 'all', label: 'All' },
              ...LEAVE_REQUEST_STATUSES.map(value => ({
                value,
                label: LeaveRequestStatusNames[value],
              })),
            ]}
          />
        </Form.Item>
        <Form.Item name="leaveTypeId" label="Leave Type" {...formItemLayout}>
          <Select
            allowClear
            options={leaveTypes.map(type => ({
              value: type?._id,
              label: type?.name,
            }))}
          />
        </Form.Item>
        <Form.Item name="dates" label="Dates" {...formItemLayout}>
          <DatePicker.RangePicker format="DD MMM YYYY" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0 }}>
          <Flex justify="flex-end">
            <Button type="primary" htmlType="submit">
              Search
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </div>
  );

  const getTableHeader = () => (
    <div className="list-table-header">
      <Space size={12}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={() => setNewOpen(true)}
        >
          New Leave Request
        </Button>
      </Space>
      <div className="list-table-header-utilities">
        <Space size={8}>
          <Popover
            trigger="click"
            placement="bottomRight"
            open={filterOpen}
            onOpenChange={openFilter}
            content={filterPanel}
          >
            <Badge count={chips.length} size="small" offset={[-2, 2]}>
              <Button icon={<FilterOutlined />}>Filter</Button>
            </Badge>
          </Popover>
          <Button
            icon={<SyncOutlined />}
            onClick={handleRefresh}
            title="Reload Data"
          />
        </Space>
        {chips.length > 0 ? (
          <Flex
            wrap="wrap"
            gap={8}
            align="center"
            justify="flex-end"
            className="list-filter-chips"
          >
            {chips.map(chip => (
              <Tag
                key={chip.key}
                closable
                onClose={event => {
                  event.preventDefault();
                  setPageParams({ pageIndex: 0, ...chip.clear });
                }}
              >
                {chip.label}
              </Tag>
            ))}
            <Button
              type="link"
              size="small"
              onClick={() =>
                setPageParams({
                  pageIndex: 0,
                  status: 'all',
                  leaveTypeId: '',
                  fromDate: '',
                  toDate: '',
                })
              }
            >
              Clear all
            </Button>
          </Flex>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="list-container" ref={containerRef}>
      {loading && !data ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          className="list-table"
          rowKey="_id"
          dataSource={rows}
          columns={columns}
          title={getTableHeader}
          bordered
          size="middle"
          tableLayout="fixed"
          pagination={false}
          scroll={{ y: scrollY }}
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
              total={data?.pagedLeaveRequests?.totalResults ?? 0}
            />
          )}
        />
      )}
      <NewLeaveRequestModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  );
};

export default LeavesList;
