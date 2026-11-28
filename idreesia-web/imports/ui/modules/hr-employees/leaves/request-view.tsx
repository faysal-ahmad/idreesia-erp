import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  Alert,
  Button,
  Collapse,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Spin,
  Tag,
  type CollapseProps,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  LeaveRequestStatus,
  LeaveRequestStatusNames,
  type LeaveRequestStatusValue,
} from 'meteor/idreesia-common/constants/hr/employment';
import {
  PersonPickerField,
  type PickedPerson,
} from '/imports/ui/modules/helpers/controls';
import { HrEmployeesSubModulePaths as paths } from '/imports/ui/modules/hr-employees';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import {
  APPROVE_LEAVE_REQUEST,
  CANCEL_LEAVE_REQUEST,
  LEAVE_REFETCH_QUERIES,
  LEAVE_REQUEST_BY_ID,
  RECORD_LEAVE_CONFIRMATION,
  REJECT_LEAVE_REQUEST,
  hrLeaveConfirmationSource,
} from './gql';
import { formatLeaveDates, LEAVE_STATUS_COLORS } from './leave-display';
import useLeaveAccess from './use-leave-access';

type Props = RouteComponentProps<{ requestId: string }>;

interface ConfirmationValues {
  confirmedWith: PickedPerson | null;
  confirmedOn: dayjs.Dayjs;
  confirmationRemarks?: string;
}

const formatTime = (value?: string | null) =>
  value ? dayjs(Number(value)).format('DD MMM YYYY') : '';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

/** One leave request, with the actions its status allows. */
const LeaveRequestView = ({ match, history }: Props) => {
  const { requestId } = match.params;
  const { canManage, canApprove } = useLeaveAccess();
  const [confirmationForm] = Form.useForm<ConfirmationValues>();
  const [rejectForm] = Form.useForm<{ rejectionReason?: string }>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const { data, loading } = useQuery(LEAVE_REQUEST_BY_ID, {
    variables: { _id: requestId },
  });
  const options = { refetchQueries: LEAVE_REFETCH_QUERIES };
  const [recordConfirmation, { loading: recording }] = useMutation(
    RECORD_LEAVE_CONFIRMATION,
    options
  );
  const [approve, { loading: approving }] = useMutation(
    APPROVE_LEAVE_REQUEST,
    options
  );
  const [reject, { loading: rejecting }] = useMutation(
    REJECT_LEAVE_REQUEST,
    options
  );
  const [cancel, { loading: cancelling }] = useMutation(
    CANCEL_LEAVE_REQUEST,
    options
  );

  const request = data?.leaveRequestById;
  const personName = request?.person?.sharedData?.name;
  useDynamicBreadcrumbs(['HR - Employees', 'Leaves', personName || 'Leave Request']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!request?._id) {
    return (
      <Empty description="Leave request not found" style={{ padding: '80px 0' }} />
    );
  }

  const requestStatus = request.status as LeaveRequestStatusValue;
  const isSubmitted = requestStatus === LeaveRequestStatus.SUBMITTED;
  const canCancel =
    isSubmitted || requestStatus === LeaveRequestStatus.APPROVED;
  const reportsTo = request.person?.employeeData?.reportsTo;

  const run = (promise: Promise<unknown>, success: string) =>
    promise
      .then(() => message.success(success, 2))
      .catch((error: Error) => message.error(error.message, 5));

  const openConfirmation = () => {
    let defaultPerson: PickedPerson | null = null;
    if (request.confirmedWith?._id) {
      defaultPerson = {
        _id: request.confirmedWith._id,
        name: request.confirmedWith.sharedData?.name,
      };
    } else if (reportsTo?._id) {
      defaultPerson = { _id: reportsTo._id, name: reportsTo.sharedData?.name };
    }
    confirmationForm.setFieldsValue({
      confirmedWith: defaultPerson,
      confirmedOn: dayjs(),
      confirmationRemarks: request.confirmationRemarks ?? undefined,
    });
    setShowConfirmation(true);
  };

  const handleRecordConfirmation = async () => {
    let values: ConfirmationValues;
    try {
      values = await confirmationForm.validateFields();
    } catch {
      return;
    }
    try {
      await recordConfirmation({
        variables: {
          _id: request._id as string,
          version: request.version as number,
          confirmedWithPersonId: values.confirmedWith?._id as string,
          confirmedOn: values.confirmedOn.toISOString(),
          confirmationRemarks: values.confirmationRemarks || null,
        },
      });
      message.success('Recorded', 2);
      setShowConfirmation(false);
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  const handleReject = async () => {
    const { rejectionReason } = rejectForm.getFieldsValue();
    try {
      await reject({
        variables: { _id: request._id as string, rejectionReason: rejectionReason || null },
      });
      message.success('Leave rejected', 2);
      setShowReject(false);
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  const decisionItems = [
    request.approvedAt
      ? { key: 'approved', label: 'Approved On', children: formatTime(request.approvedAt) }
      : null,
    request.rejectedAt
      ? { key: 'rejected', label: 'Rejected On', children: formatTime(request.rejectedAt) }
      : null,
    request.rejectionReason
      ? { key: 'reason', label: 'Rejection Reason', children: request.rejectionReason }
      : null,
    request.cancelledAt
      ? { key: 'cancelled', label: 'Cancelled On', children: formatTime(request.cancelledAt) }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; children: React.ReactNode }>;

  const sections: CollapseProps['items'] = [
    {
      key: 'request',
      label: 'Leave Request',
      children: (
        <Descriptions
          column={1}
          size="small"
          labelStyle={{ width: 180 }}
          items={[
            {
              key: 'employee',
              label: 'Employee',
              children: request.person?._id ? (
                <a
                  onClick={() =>
                    history.push(
                      `${paths.employeeEditFormPath(request.person?._id as string)}?default-active-tab=leaves`
                    )
                  }
                >
                  {personName}
                </a>
              ) : (
                ''
              ),
            },
            {
              key: 'job',
              label: 'Job',
              children: request.person?.employeeData?.job?.name ?? '-',
            },
            { key: 'type', label: 'Leave Type', children: request.leaveType?.name },
            { key: 'dates', label: 'Dates', children: formatLeaveDates(request) },
            { key: 'days', label: 'Working Days', children: request.days },
            { key: 'reason', label: 'Reason', children: request.reason || '-' },
            {
              key: 'status',
              label: 'Status',
              children: (
                <Tag color={LEAVE_STATUS_COLORS[requestStatus]}>
                  {LeaveRequestStatusNames[requestStatus] ?? request.status}
                </Tag>
              ),
            },
            ...decisionItems,
          ]}
        />
      ),
    },
    {
      key: 'check',
      label: 'Check With',
      children: (
        <>
          <Descriptions
            column={1}
            size="small"
            labelStyle={{ width: 180 }}
            items={[
              {
                key: 'reportsTo',
                label: 'Reports To',
                children: reportsTo?._id
                  ? [
                      reportsTo.sharedData?.name,
                      reportsTo.sharedData?.contactNumber1,
                      reportsTo.sharedData?.contactNumber2,
                    ]
                      .filter(Boolean)
                      .join(' · ')
                  : 'Not set for this employee',
              },
              {
                key: 'checked',
                label: 'HR Checked With',
                children: request.confirmedWith?._id
                  ? `${request.confirmedWith.sharedData?.name} on ${formatTime(request.confirmedOn)}`
                  : 'Not recorded',
              },
              ...(request.confirmationRemarks
                ? [
                    {
                      key: 'remarks',
                      label: 'Remarks',
                      children: request.confirmationRemarks,
                    },
                  ]
                : []),
            ]}
          />
          {isSubmitted && canManage ? (
            <Button style={{ marginTop: 12 }} onClick={openConfirmation}>
              {request.confirmedWith?._id ? 'Update Check' : 'Record Check'}
            </Button>
          ) : null}
        </>
      ),
    },
  ];

  return (
    <div className="visitor-form">
      {request.balanceWarning ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={request.balanceWarning}
        />
      ) : null}
      <Collapse
        className="visitor-form-sections"
        defaultActiveKey={['request', 'check']}
        items={sections}
      />
      <Space style={{ marginTop: 16, width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={() => history.push(paths.leavesPath)}>Back</Button>
        {canCancel && canManage ? (
          <Popconfirm
            title="Cancel this leave request?"
            onConfirm={() => run(cancel({ variables: { _id: request._id as string } }), 'Leave cancelled')}
            okText="Yes"
            cancelText="No"
          >
            <Button loading={cancelling}>Cancel Leave</Button>
          </Popconfirm>
        ) : null}
        {isSubmitted && canApprove ? (
          <>
            <Button
              danger
              loading={rejecting}
              onClick={() => {
                rejectForm.resetFields();
                setShowReject(true);
              }}
            >
              Reject
            </Button>
            <Popconfirm
              title={
                request.balanceWarning
                  ? `${request.balanceWarning} Approve anyway?`
                  : 'Approve this leave request?'
              }
              onConfirm={() =>
                run(approve({ variables: { _id: request._id as string } }), 'Leave approved')
              }
              okText="Approve"
              cancelText="No"
            >
              <Button type="primary" loading={approving}>
                Approve
              </Button>
            </Popconfirm>
          </>
        ) : null}
      </Space>
      <AuditInfo record={request} />

      <Modal
        title="Record Whom HR Checked With"
        open={showConfirmation}
        okText="Save"
        confirmLoading={recording}
        onOk={handleRecordConfirmation}
        onCancel={() => setShowConfirmation(false)}
        width={620}
        forceRender
      >
        <Form form={confirmationForm} layout="horizontal" style={{ width: '100%' }}>
          <PersonPickerField
            fieldName="confirmedWith"
            fieldLabel="Checked With"
            source={hrLeaveConfirmationSource}
            drawerTitle="Select whom HR checked with"
            required
            requiredMessage="Please select whom you checked with."
            fieldLayout={formItemLayout}
          />
          <Form.Item
            name="confirmedOn"
            label="On"
            rules={[{ required: true, message: 'Please enter the date.' }]}
            {...formItemLayout}
          >
            <DatePicker format="DD MMM YYYY" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="confirmationRemarks" label="Remarks" {...formItemLayout}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Reject Leave Request"
        open={showReject}
        okText="Reject"
        okButtonProps={{ danger: true }}
        confirmLoading={rejecting}
        onOk={handleReject}
        onCancel={() => setShowReject(false)}
        forceRender
      >
        <Form form={rejectForm} layout="vertical" style={{ width: '100%' }}>
          <Form.Item name="rejectionReason" label="Reason (optional)">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveRequestView;
