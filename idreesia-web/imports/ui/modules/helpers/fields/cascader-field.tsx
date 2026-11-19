import React from 'react';
import { Cascader, Form } from 'antd';
import type { Rule } from 'antd/es/form';

interface CascaderOption {
  value?: string | number | null;
  label?: React.ReactNode;
  children?: CascaderOption[];
}

interface FieldProps {
  data?: CascaderOption[];
  changeOnSelect?: boolean;
  fieldName: string;
  fieldLabel?: string;
  placeholder?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: unknown;
  required?: boolean;
  requiredMessage?: string;
  disabled?: boolean;
  /** Extra validation rules, after the required rule. */
  rules?: Rule[];
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
const CascaderField = ({
  data,
  changeOnSelect = true,
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  initialValue = null,
  required,
  requiredMessage,
  disabled,
  rules: extraRules = [],
}: FieldProps) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
    ...extraRules,
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
        <Cascader
          disabled={disabled}
          options={data}
          placeholder={placeholder}
          expandTrigger="hover"
          changeOnSelect={changeOnSelect}
        />
    </Form.Item>
  );
};

export default CascaderField;
