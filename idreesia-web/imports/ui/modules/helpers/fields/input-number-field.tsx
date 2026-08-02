import React from 'react';

import { InputNumber, Form } from 'antd';

interface FieldProps {
  fieldName: string;
  fieldLabel?: string;
  placeholder?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: number | null;
  minValue?: number;
  maxValue?: number;
  precision?: number;
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
 * placeholder: Placeholder text to show in the form field.
 * fieldLayout: Layout settings for the form field.
 * initialValue: Initial value for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 */
const InputNumberField = ({
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  initialValue = null,
  minValue,
  maxValue,
  precision,
  required,
  requiredMessage,
  disabled,
}: FieldProps) => {
  const additionalProps: Record<string, number> = {};
  if (minValue || minValue === 0) additionalProps.min = minValue;
  if (maxValue) additionalProps.max = maxValue;
  if (precision) additionalProps.precision = precision;

  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} rules={rules} initialValue={initialValue} {...fieldLayout}>
        <InputNumber disabled={disabled} placeholder={placeholder} {...additionalProps} />
    </Form.Item>
  );
};

export default InputNumberField;
