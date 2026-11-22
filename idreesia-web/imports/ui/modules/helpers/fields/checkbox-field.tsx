import React from 'react';
import { Checkbox, Form } from 'antd';

interface FieldProps {
  fieldName: string;
  fieldLabel?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: boolean;
  required?: boolean;
  requiredMessage?: string;
  disabled?: boolean;
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
const CheckboxField = ({
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  initialValue = false,
  required,
  requiredMessage,
  disabled,
}: FieldProps) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} valuePropName="checked" initialValue={initialValue} rules={rules} {...fieldLayout}>
      <Checkbox disabled={disabled} />
    </Form.Item>
  );
};

export default CheckboxField;
