import React from 'react';

import { Select, Form } from 'antd';

type OptionValue = string | number;
type DefaultRecord = { _id?: string | null; name?: string | null };

interface FieldProps<T> {
  allowClear?: boolean;
  dropdownMatchSelectWidth?: boolean;
  mode?: string;
  data?: T[];
  getDataValue?(data: T): OptionValue;
  getDataText?(data: T): React.ReactNode;
  initialValue?: string | string[] | null;
  fieldLayout?: Record<string, unknown>;
  fieldName: string;
  fieldLabel?: string;
  placeholder?: string;
  required?: boolean;
  requiredMessage?: string;
  onChange?(value: unknown): void;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

/**
 * data: Array of objects (containing text and value)
 * getDataValue: Function that returns the "value" from the above data object
 * getDataText: Function that returns the "text" from the above data object
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * placeholder: Placeholder text to show in the form field.
 * fieldLayout: Layout settings for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 * initialValue: Initial values to set in the form field.
 * handleValueChanged: Callback for whenever the selected value changes.
 */
function SelectField<T = DefaultRecord>({
  allowClear = true,
  dropdownMatchSelectWidth = true,
  mode = 'default',
  data = [],
  getDataValue,
  getDataText,
  initialValue = null,
  fieldLayout = formItemLayout,
  fieldName,
  fieldLabel,
  placeholder,
  required,
  requiredMessage,
  onChange,
}: FieldProps<T>) {
  const resolveValue =
    getDataValue ?? ((item: T) => (item as DefaultRecord)._id as OptionValue);
  const resolveText =
    getDataText ?? ((item: T) => (item as DefaultRecord).name);

  const options: React.ReactNode[] = [];
  data.forEach((dataObj) => {
    const value = resolveValue(dataObj);
    const text = resolveText(dataObj);
    options.push(
      <Select.Option key={value} value={value}>
        {text}
      </Select.Option>
    );
  });

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
      <Select
        placeholder={placeholder}
        onChange={onChange}
        allowClear={allowClear}
        mode={mode as any}
        dropdownMatchSelectWidth={dropdownMatchSelectWidth}
      >
        {options}
      </Select>
    </Form.Item>
  );
}

export default SelectField;
