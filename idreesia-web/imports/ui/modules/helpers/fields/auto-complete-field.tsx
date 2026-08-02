import React from "react";

import { AutoComplete, Form } from "antd";
import type { AutoCompleteProps } from "antd";

interface FieldProps {
  dataSource?: string[];
  fieldName: string;
  fieldLabel?: string;
  placeholder?: string;
  fieldLayout?: Record<string, unknown>;
  required?: boolean;
  requiredMessage?: string;
  initialValue?: string | null;
  filterOption?: AutoCompleteProps['filterOption'];
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const filterOptionFunc: NonNullable<AutoCompleteProps['filterOption']> = (_inputValue, option) => {
  const key = String(option?.value ?? option?.key ?? '').toLowerCase();
  const inputValue = _inputValue.toLowerCase();
  if (key.startsWith(inputValue)) return true;
  return false;
};

/**
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * placeholder: Placeholder text to show in the form field.
 * fieldLayout: Layout settings for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 */
const AutoCompleteField = ({
  dataSource = [],
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  required,
  requiredMessage,
  initialValue = null,
  filterOption = filterOptionFunc,
}: FieldProps) => {
  const rules = required
    ? [
        {
          required,
          message: requiredMessage,
        },
      ]
    : undefined;

  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <AutoComplete
        placeholder={placeholder}
        dataSource={dataSource}
        backfill
        filterOption={filterOption}
      />
    </Form.Item>
  );
};

export default AutoCompleteField;
