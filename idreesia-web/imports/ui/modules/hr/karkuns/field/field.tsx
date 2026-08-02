import React from 'react';

import { Form } from 'antd';
import Input from './input';

interface FieldProps {
  fieldName: string;
  fieldLabel?: string;
  fieldLayout?: Record<string, unknown>;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  requiredMessage?: string;
  initialValue?: unknown;
  predefinedFilterName?: string;
  predefinedFilterStoreId?: string;
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
const Field = ({
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  placeholder,
  disabled,
  required,
  requiredMessage,
  initialValue = null,
  predefinedFilterName,
  predefinedFilterStoreId,
}: FieldProps) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item
      name={fieldName}
      label={fieldLabel}
      initialValue={initialValue}
      rules={rules}
      {...fieldLayout}
    >
      <Input
        placeholder={placeholder}
        disabled={disabled}
        predefinedFilterName={predefinedFilterName}
        predefinedFilterStoreId={predefinedFilterStoreId}
      />
    </Form.Item>
  );
};

export default Field;
