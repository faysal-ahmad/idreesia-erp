import React from 'react';
import PropTypes from 'prop-types';

import { Form } from 'antd';
import { AttendanceDetail } from '../controls';

const AntFormItem = (Form as any).Item;
const AttendanceDetailInput = AttendanceDetail as any;
interface FieldProps { forMonth?: string; initialValue?: Record<string, unknown>; fieldName: string; fieldLabel?: string; fieldLayout?: Record<string, unknown>; required?: boolean; requiredMessage?: string; }

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
    <AntFormItem
      name={fieldName}
      label={fieldLabel}
      {...fieldLayout}
      rules={rules}
    >
      <AttendanceDetailInput forMonth={forMonth} initialValue={initialValue} />
    </AntFormItem>
  );
}

AttendanceDetailField.propTypes = {
  forMonth: PropTypes.string,
  initialValue: PropTypes.object,
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldLayout: PropTypes.object,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
};

export default AttendanceDetailField;