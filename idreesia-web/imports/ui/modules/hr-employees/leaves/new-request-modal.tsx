import React, { useEffect } from 'react';
import type { Dayjs } from 'dayjs';
import { useMutation, useQuery } from '@apollo/client/react';
import { DatePicker, Form, Input, Modal, Select, Switch } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  PersonPickerField,
  type PickedPerson,
} from '/imports/ui/modules/helpers/controls';

import {
  ALL_LEAVE_TYPES,
  CREATE_LEAVE_REQUEST,
  LEAVE_DAYS_COUNT,
  LEAVE_REFETCH_QUERIES,
  hrLeaveEmployeesSource,
} from './gql';

interface FormValues {
  person?: PickedPerson | null;
  leaveTypeId: string;
  dates: [Dayjs, Dayjs];
  halfDay?: boolean;
  reason?: string;
}

interface Props {
  open: boolean;
  /** Fixes the employee (on the employee's Leaves tab). */
  personId?: string;
  onClose(): void;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const toCalendarDate = (value?: Dayjs | null) =>
  value ? value.format('YYYY-MM-DD') : '';

/** Enters a leave request. Going over the balance is shown as a warning. */
const NewLeaveRequestModal = ({ open, personId, onClose }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const { data: typesData } = useQuery(ALL_LEAVE_TYPES);
  const [createLeaveRequest, { loading }] = useMutation(CREATE_LEAVE_REQUEST, {
    refetchQueries: LEAVE_REFETCH_QUERIES,
  });

  const person = Form.useWatch('person', form);
  const dates = Form.useWatch('dates', form);
  const halfDay = Form.useWatch('halfDay', form);
  const selectedPersonId = personId ?? person?._id;
  const fromDate = toCalendarDate(dates?.[0]);
  const toDate = toCalendarDate(dates?.[1]);
  const singleDay = !!fromDate && fromDate === toDate;

  const { data: countData, error: countError } = useQuery(LEAVE_DAYS_COUNT, {
    variables: {
      personId: selectedPersonId ?? '',
      fromDate,
      toDate,
      halfDay: singleDay && !!halfDay,
    },
    skip: !open || !selectedPersonId || !fromDate || !toDate,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (open) form.resetFields();
  }, [open]);

  useEffect(() => {
    if (!singleDay && halfDay) form.setFieldsValue({ halfDay: false });
  }, [singleDay]);

  const leaveTypes = (typesData?.allLeaveTypes ?? []).filter(
    type => type?._id && type.isActive
  );

  const handleSave = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      const result = await createLeaveRequest({
        variables: {
          personId: (personId ?? values.person?._id) as string,
          leaveTypeId: values.leaveTypeId,
          fromDate: toCalendarDate(values.dates[0]),
          toDate: toCalendarDate(values.dates[1]),
          halfDay: singleDay && !!values.halfDay,
          reason: values.reason || null,
        },
      });
      const warning = result.data?.createLeaveRequest?.balanceWarning;
      if (warning) message.warning(`Leave request saved. ${warning}`, 8);
      else message.success('Leave request saved', 2);
      onClose();
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  let daysText: string | null = null;
  if (countError) daysText = countError.message;
  else if (countData?.leaveDaysCount != null) {
    daysText = `${countData.leaveDaysCount} working day(s) for this employee.`;
  }

  return (
    <Modal
      title="New Leave Request"
      open={open}
      width={620}
      okText="Save"
      confirmLoading={loading}
      onOk={handleSave}
      onCancel={onClose}
      forceRender
    >
      <Form form={form} layout="horizontal" style={{ width: '100%' }}>
        {!personId ? (
          <PersonPickerField
            fieldName="person"
            fieldLabel="Employee"
            source={hrLeaveEmployeesSource}
            drawerTitle="Select Employee"
            required
            requiredMessage="Please select the employee."
            fieldLayout={formItemLayout}
          />
        ) : null}
        <Form.Item
          name="leaveTypeId"
          label="Leave Type"
          rules={[{ required: true, message: 'Please select the leave type.' }]}
          {...formItemLayout}
        >
          <Select
            options={leaveTypes.map(type => ({
              value: type?._id,
              label: type?.name,
            }))}
          />
        </Form.Item>
        <Form.Item
          name="dates"
          label="Dates"
          extra={daysText}
          rules={[{ required: true, message: 'Please select the dates.' }]}
          {...formItemLayout}
        >
          <DatePicker.RangePicker
            format="DD MMM YYYY"
            style={{ width: '100%' }}
          />
        </Form.Item>
        {singleDay ? (
          <Form.Item
            name="halfDay"
            label="Half Day"
            valuePropName="checked"
            {...formItemLayout}
          >
            <Switch />
          </Form.Item>
        ) : null}
        <Form.Item name="reason" label="Reason" {...formItemLayout}>
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewLeaveRequestModal;
