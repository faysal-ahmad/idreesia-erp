import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Collapse,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  type CollapseProps,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  LeaveRequestStatusNames,
  type LeaveRequestStatusValue,
} from 'meteor/idreesia-common/constants/hr/employment';
import { HrEmployeesSubModulePaths as paths } from '/imports/ui/modules/hr-employees';

import {
  ALL_LEAVE_TYPES,
  CREATE_LEAVE_ADJUSTMENT,
  LEAVE_ADJUSTMENTS_BY_PERSON_ID,
  LEAVE_BALANCES,
  PAGED_LEAVE_REQUESTS,
  REMOVE_LEAVE_ADJUSTMENT,
} from './gql';
import NewLeaveRequestModal from './new-request-modal';
import { formatLeaveDates, LEAVE_STATUS_COLORS } from './leave-display';
import useLeaveAccess from './use-leave-access';

interface Props {
  employeeId: string;
}

interface AdjustmentValues {
  leaveTypeId: string;
  days: number;
  reason: string;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_v, i) => CURRENT_YEAR + 1 - i);

/** An employee's leave balances, requests and adjustments for a year. */
const EmployeeLeaves = ({ employeeId }: Props) => {
  const { canManage } = useLeaveAccess();
  const [year, setYear] = useState(CURRENT_YEAR);
  const [newOpen, setNewOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustForm] = Form.useForm<AdjustmentValues>();

  const { data: balancesData, loading: balancesLoading } = useQuery(
    LEAVE_BALANCES,
    { variables: { personId: employeeId, year } }
  );
  const { data: requestsData, loading: requestsLoading } = useQuery(
    PAGED_LEAVE_REQUESTS,
    {
      variables: {
        personId: employeeId,
        fromDate: `${year}-01-01`,
        toDate: `${year}-12-31`,
        pageIndex: '0',
        pageSize: '200',
      },
    }
  );
  const { data: adjustmentsData } = useQuery(LEAVE_ADJUSTMENTS_BY_PERSON_ID, {
    variables: { personId: employeeId, year },
  });
  const { data: typesData } = useQuery(ALL_LEAVE_TYPES);
  const adjustmentOptions = {
    refetchQueries: ['leaveAdjustmentsByPersonId', 'leaveBalances'],
  };
  const [createAdjustment, { loading: adjusting }] = useMutation(
    CREATE_LEAVE_ADJUSTMENT,
    adjustmentOptions
  );
  const [removeAdjustment] = useMutation(
    REMOVE_LEAVE_ADJUSTMENT,
    adjustmentOptions
  );

  const balances = (balancesData?.leaveBalances ?? []).filter(
    balance => !!balance?.leaveTypeId
  );
  const requests = (requestsData?.pagedLeaveRequests?.data ?? []).filter(
    request => !!request?._id
  );
  const adjustments = (adjustmentsData?.leaveAdjustmentsByPersonId ?? []).filter(
    adjustment => !!adjustment?._id
  );

  const handleAddAdjustment = async () => {
    let values: AdjustmentValues;
    try {
      values = await adjustForm.validateFields();
    } catch {
      return;
    }
    try {
      await createAdjustment({
        variables: { personId: employeeId, year, ...values },
      });
      message.success('Adjustment added', 2);
      setAdjustOpen(false);
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  const tableProps = {
    className: 'list-table',
    size: 'middle' as const,
    bordered: true,
    tableLayout: 'fixed' as const,
    pagination: false as const,
  };

  const sections: CollapseProps['items'] = [
    {
      key: 'balances',
      label: `Balances for ${year}`,
      children: (
        <Table
          {...tableProps}
          rowKey="leaveTypeId"
          loading={balancesLoading}
          dataSource={balances}
          locale={{ emptyText: 'No leave types set up' }}
          columns={[
            { title: 'Leave Type', dataIndex: 'leaveTypeName', key: 'name' },
            { title: 'Entitled', dataIndex: 'entitlement', key: 'entitlement', width: 90 },
            { title: 'Carried', dataIndex: 'carriedForward', key: 'carried', width: 90 },
            { title: 'Adjusted', dataIndex: 'adjustments', key: 'adjustments', width: 90 },
            { title: 'Used', dataIndex: 'used', key: 'used', width: 80 },
            { title: 'Pending', dataIndex: 'pending', key: 'pending', width: 90 },
            {
              title: 'Remaining',
              key: 'remaining',
              width: 100,
              render: (_t: unknown, row: (typeof balances)[number]) =>
                row?.isPaid ? (
                  <span style={{ color: (row.remaining ?? 0) < 0 ? '#d92d20' : undefined }}>
                    {row.remaining}
                  </span>
                ) : (
                  '-'
                ),
            },
          ]}
        />
      ),
    },
    {
      key: 'requests',
      label: 'Requests',
      extra: canManage ? (
        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={event => {
            event.stopPropagation();
            setNewOpen(true);
          }}
        >
          New Request
        </Button>
      ) : null,
      children: (
        <Table
          {...tableProps}
          rowKey="_id"
          loading={requestsLoading}
          dataSource={requests}
          locale={{ emptyText: `No leave requests in ${year}` }}
          columns={[
            {
              title: 'Dates',
              key: 'dates',
              render: (_t: unknown, row: (typeof requests)[number]) => (
                <Link to={paths.leaveRequestPath(row?._id as string)}>
                  {formatLeaveDates(row ?? {})}
                </Link>
              ),
            },
            {
              title: 'Type',
              key: 'type',
              width: 120,
              render: (_t: unknown, row: (typeof requests)[number]) =>
                row?.leaveType?.name,
            },
            { title: 'Days', dataIndex: 'days', key: 'days', width: 80 },
            {
              title: 'Status',
              key: 'status',
              width: 120,
              render: (_t: unknown, row: (typeof requests)[number]) => (
                <Tag color={LEAVE_STATUS_COLORS[row?.status as LeaveRequestStatusValue]}>
                  {LeaveRequestStatusNames[row?.status as LeaveRequestStatusValue] ??
                    row?.status}
                </Tag>
              ),
            },
          ]}
        />
      ),
    },
    {
      key: 'adjustments',
      label: 'Adjustments',
      extra: canManage ? (
        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={event => {
            event.stopPropagation();
            adjustForm.resetFields();
            setAdjustOpen(true);
          }}
        >
          Add Adjustment
        </Button>
      ) : null,
      children: (
        <Table
          {...tableProps}
          rowKey="_id"
          dataSource={adjustments}
          locale={{ emptyText: `No adjustments in ${year}` }}
          columns={[
            {
              title: 'Leave Type',
              key: 'type',
              width: 140,
              render: (_t: unknown, row: (typeof adjustments)[number]) =>
                row?.leaveType?.name,
            },
            {
              title: 'Days',
              key: 'days',
              width: 90,
              render: (_t: unknown, row: (typeof adjustments)[number]) =>
                (row?.days ?? 0) > 0 ? `+${row?.days}` : row?.days,
            },
            { title: 'Reason', dataIndex: 'reason', key: 'reason' },
            {
              key: 'action',
              width: 60,
              render: (_t: unknown, row: (typeof adjustments)[number]) =>
                canManage ? (
                  <div className="list-actions-column">
                    <Popconfirm
                      title="Delete this adjustment?"
                      onConfirm={() =>
                        removeAdjustment({ variables: { _id: row?._id as string } })
                          .then(() => message.success('Adjustment deleted', 2))
                          .catch((error: Error) => message.error(error.message, 5))
                      }
                      okText="Yes"
                      cancelText="No"
                    >
                      <Tooltip title="Delete">
                        <DeleteOutlined className="list-actions-icon" />
                      </Tooltip>
                    </Popconfirm>
                  </div>
                ) : null,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 960 }}>
      <Space style={{ marginBottom: 12 }}>
        <span>Year</span>
        <Select
          value={year}
          onChange={setYear}
          style={{ width: 120 }}
          options={YEAR_OPTIONS.map(value => ({ value, label: String(value) }))}
        />
      </Space>
      <Collapse
        className="visitor-form-sections"
        defaultActiveKey={['balances', 'requests', 'adjustments']}
        items={sections}
      />
      <NewLeaveRequestModal
        open={newOpen}
        personId={employeeId}
        onClose={() => setNewOpen(false)}
      />
      <Modal
        title={`Add Leave Adjustment for ${year}`}
        open={adjustOpen}
        okText="Save"
        confirmLoading={adjusting}
        onOk={handleAddAdjustment}
        onCancel={() => setAdjustOpen(false)}
        forceRender
      >
        <Form form={adjustForm} layout="horizontal" style={{ width: '100%' }}>
          <Form.Item
            name="leaveTypeId"
            label="Leave Type"
            rules={[{ required: true, message: 'Please select the leave type.' }]}
            {...formItemLayout}
          >
            <Select
              options={(typesData?.allLeaveTypes ?? [])
                .filter(type => type?._id)
                .map(type => ({ value: type?._id, label: type?.name }))}
            />
          </Form.Item>
          <Form.Item
            name="days"
            label="Days"
            extra="Positive adds days; negative takes them away."
            rules={[{ required: true, message: 'Please enter the days.' }]}
            {...formItemLayout}
          >
            <InputNumber step={0.5} style={{ width: 140 }} />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: 'Please enter the reason.' }]}
            {...formItemLayout}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeLeaves;
