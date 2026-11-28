import React, { useEffect } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useMutation } from '@apollo/client/react';
import { DatePicker, Form, Input, Modal, Select } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  EXIT_REASONS,
  ExitReasonNames,
} from 'meteor/idreesia-common/constants/hr/employment';

import { EXIT_EMPLOYEE, LIFECYCLE_REFETCH_QUERIES } from '../gql';
import { modalFormLayout, toDateVariable } from './shared';

interface FormValues {
  endDate: Dayjs;
  exitReason: string;
  remarks?: string;
}

interface Props {
  personId: string | null;
  personName?: string | null;
  onClose(): void;
}

/** Ends an employee's employment. They stay a karkun. */
const ExitEmployeeModal = ({ personId, personName, onClose }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [exitEmployee, { loading }] = useMutation(EXIT_EMPLOYEE, {
    refetchQueries: LIFECYCLE_REFETCH_QUERIES,
  });

  useEffect(() => {
    if (personId) {
      form.setFieldsValue({
        endDate: dayjs().startOf('day'),
        exitReason: undefined,
        remarks: undefined,
      });
    }
  }, [personId]);

  const handleSave = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      await exitEmployee({
        variables: {
          personId: personId as string,
          endDate: toDateVariable(values.endDate) as string,
          exitReason: values.exitReason,
          remarks: values.remarks || null,
        },
      });
      message.success('Employment ended', 2);
      onClose();
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  return (
    <Modal
      title={`End Employment${personName ? `: ${personName}` : ''}`}
      open={!!personId}
      okText="End Employment"
      okButtonProps={{ danger: true }}
      confirmLoading={loading}
      onOk={handleSave}
      onCancel={onClose}
      forceRender
    >
      <Form form={form} layout="horizontal" style={{ width: '100%' }}>
        <Form.Item
          name="endDate"
          label="Last Day"
          rules={[{ required: true, message: 'Please enter the date.' }]}
          {...modalFormLayout}
        >
          <DatePicker format="DD MMM YYYY" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="exitReason"
          label="Reason"
          rules={[{ required: true, message: 'Please select the reason.' }]}
          {...modalFormLayout}
        >
          <Select
            options={EXIT_REASONS.map(reason => ({
              value: reason,
              label: ExitReasonNames[reason],
            }))}
          />
        </Form.Item>
        <Form.Item name="remarks" label="Remarks" {...modalFormLayout}>
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExitEmployeeModal;
