import React from 'react';
import { Checkbox, Form } from 'antd';

interface Option {
  label: string;
  value: string;
}

interface FieldProps {
  fieldName: string;
  fieldLabel?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: string[];
  options?: Option[];
  required?: boolean;
  requiredMessage?: string;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

/**
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * fieldLayout: Layout settings for the form field.
 * initialValue: Initial value for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 */
const CheckboxGroupField = ({
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  initialValue = [],
  options,
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
      <Checkbox.Group options={options} />
    </Form.Item>
  );
};

export default CheckboxGroupField;
