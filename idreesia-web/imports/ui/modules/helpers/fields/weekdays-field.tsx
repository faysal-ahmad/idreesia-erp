import React from 'react';
import PropTypes from 'prop-types';

import { Checkbox, Form } from 'antd';

const AntFormItem = (Form as any).Item;
const CheckboxInput = Checkbox as any;
interface FieldProps { fieldName: string; fieldLabel?: string; fieldLayout?: Record<string, unknown>; initialValue?: string[]; required?: boolean; requiredMessage?: string; }

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const options = [
  { label: 'Saturday', value: 'Sat' },
  { label: 'Sunday', value: 'Sun' },
  { label: 'Monday', value: 'Mon' },
  { label: 'Tuesday', value: 'Tue' },
  { label: 'Wednesday', value: 'Wed' },
  { label: 'Thursday', value: 'Thu' },
  { label: 'Friday', value: 'Fri' },
];

/**
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * placeholder: Placeholder text to show in the form field.
 * fieldLayout: Layout settings for the form field.
 * initialValue: Initial value for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 */
const WeekDaysField = ({
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  initialValue = [],
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
    <AntFormItem name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <CheckboxInput.Group options={options} />
    </AntFormItem>
  );
}

WeekDaysField.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.array,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
};

export default WeekDaysField;