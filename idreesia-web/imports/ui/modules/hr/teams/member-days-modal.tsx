import React, { useEffect, useRef } from 'react';
import { Form, Modal } from 'antd';

import WeekDaysField from '/imports/ui/modules/helpers/fields/weekdays-field';

export const TEAM_DAYS = [
  'Sat',
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
] as const;

export function formatMemberDays(
  days: Array<string | null> | null | undefined,
  hasSchedule: boolean
) {
  if (!hasSchedule) return 'All days';
  const selected = TEAM_DAYS.filter(day => (days ?? []).includes(day));
  if (selected.length === TEAM_DAYS.length) return 'All days';
  return selected.join(', ');
}

interface Props {
  open: boolean;
  title: string;
  initialDays: readonly string[];
  confirmLoading?: boolean;
  onCancel: () => void;
  onSubmit: (daysOfWeek: string[]) => void;
}

const MemberDaysModal = ({
  open,
  title,
  initialDays,
  confirmLoading,
  onCancel,
  onSubmit,
}: Props) => {
  const [form] = Form.useForm<{ daysOfWeek: string[] }>();
  const initialDaysRef = useRef(initialDays);
  initialDaysRef.current = initialDays;

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ daysOfWeek: [...initialDaysRef.current] });
  }, [open, form]);

  return (
    <Modal
      title={title}
      open={open}
      width={640}
      okText="Save"
      confirmLoading={confirmLoading}
      onOk={() => form.submit()}
      onCancel={onCancel}
      destroyOnHidden
    >
      <Form
        form={form}
        onFinish={values => onSubmit(values.daysOfWeek ?? [])}
      >
        <WeekDaysField
          fieldName="daysOfWeek"
          fieldLabel="Available days"
          fieldLayout={{ labelCol: { span: 24 }, wrapperCol: { span: 24 } }}
          initialValue={[...initialDays]}
          required
          requiredMessage="Please select at least one day."
        />
      </Form>
    </Modal>
  );
};

export default MemberDaysModal;
