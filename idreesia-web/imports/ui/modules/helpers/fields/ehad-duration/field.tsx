import React from 'react';
import dayjs from 'dayjs';

import { Form } from 'antd';
import CustomInput from './input';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

interface FieldProps {
  fieldName: string;
  fieldLabel?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: unknown;
  required?: boolean;
  requiredMessage?: string;
}

/**
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * fieldLayout: Layout settings for the form field.
 * initialValue: Initial value for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 */
const Field = ({
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  initialValue = dayjs().startOf('day'),
  required,
  requiredMessage,
}: FieldProps) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <CustomInput />
    </Form.Item>
  );
};

export default Field;
