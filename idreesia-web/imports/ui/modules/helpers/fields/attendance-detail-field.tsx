import React from 'react';

import { Form } from 'antd';
import { AttendanceDetail } from '../controls';

type AttendanceValue = 'pr' | 'la' | 'ab' | 'ms' | null | undefined;
type AttendanceMap = Record<string, AttendanceValue>;

interface FieldProps {
  forMonth?: string;
  initialValue?: AttendanceMap;
  fieldName: string;
  fieldLabel?: string;
  fieldLayout?: Record<string, unknown>;
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
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 */
const AttendanceDetailField = ({
  forMonth,
  initialValue = {},
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
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
    <Form.Item
      name={fieldName}
      label={fieldLabel}
      {...fieldLayout}
      rules={rules}
    >
      <AttendanceDetail forMonth={forMonth} initialValue={initialValue} />
    </Form.Item>
  );
};

export default AttendanceDetailField;
