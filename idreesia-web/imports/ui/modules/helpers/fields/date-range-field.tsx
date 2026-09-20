import React from 'react';
import dayjs from 'dayjs';

import { DatePicker, Form } from 'antd';

interface FieldProps {
  allowClear?: boolean;
  fieldName: string;
  fieldLabel?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: unknown[];
  required?: boolean;
  requiredMessage?: string;
  showTime?: boolean;
  format?: string;
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
 * showTime: When true, the picker also captures time-of-day (default: date only).
 * format: Display format; defaults to date-only or date+time based on showTime.
 */
const DateRangeField = ({
  allowClear,
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  initialValue = [dayjs(), dayjs()],
  required,
  requiredMessage,
  showTime = false,
  format = showTime ? 'DD MMM, YYYY hh:mm a' : 'DD MMM, YYYY',
}: FieldProps) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <DatePicker.RangePicker
        format={format}
        showTime={showTime}
        allowClear={allowClear}
      />
    </Form.Item>
  );
};

export default DateRangeField;
