import React from "react";
import dayjs from "dayjs";

import { DatePicker, Form } from "antd";

interface FieldProps {
  allowClear?: boolean;
  fieldName: string;
  fieldLabel?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: unknown;
  format?: string;
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
 * placeholder: Placeholder text to show in the form field.
 * fieldLayout: Layout settings for the form field.
 * initialValue: Initial value for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 */
const MonthField = ({
  allowClear,
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  initialValue = dayjs(),
  format = "MM-YYYY",
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
      <DatePicker picker="month" allowClear={allowClear} format={format} />
    </Form.Item>
  );
};

export default MonthField;
