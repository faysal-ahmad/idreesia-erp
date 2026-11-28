import React, { useEffect } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useMutation } from '@apollo/client/react';
import { DatePicker, Form, Input, Modal } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { CONFIRM_EMPLOYEE, LIFECYCLE_REFETCH_QUERIES } from '../gql';
import { modalFormLayout, toDateVariable } from './shared';

interface FormValues {
  confirmationDate: Dayjs;
  remarks?: string;
}

interface Props {
  personId: string;
  open: boolean;
  /** Pre-fills the date (the planned probation end), when known. */
  probationEndDate?: Dayjs | null;
  onClose(): void;
}

/** Ends an employee's probation. */
const ConfirmEmployeeModal = ({
  personId,
  open,
  probationEndDate,
  onClose,
}: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [confirmEmployee, { loading }] = useMutation(CONFIRM_EMPLOYEE, {
    refetchQueries: LIFECYCLE_REFETCH_QUERIES,
  });

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        confirmationDate: probationEndDate ?? dayjs().startOf('day'),
        remarks: undefined,
      });
    }
  }, [open]);

  const handleSave = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      await confirmEmployee({
        variables: {
          personId,
          confirmationDate: toDateVariable(values.confirmationDate) as string,
          remarks: values.remarks || null,
        },
      });
      message.success('Employee confirmed', 2);
      onClose();
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  return (
    <Modal
      title="Confirm Employee"
      open={open}
      okText="Confirm"
      confirmLoading={loading}
      onOk={handleSave}
      onCancel={onClose}
      forceRender
    >
      <Form form={form} layout="horizontal" style={{ width: '100%' }}>
        <Form.Item
          name="confirmationDate"
          label="Confirmation Date"
          rules={[{ required: true, message: 'Please enter the date.' }]}
          {...modalFormLayout}
        >
          <DatePicker format="DD MMM YYYY" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="remarks" label="Remarks" {...modalFormLayout}>
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfirmEmployeeModal;
