import React from 'react';
import PropTypes from 'prop-types';

import { Checkbox, Form } from 'antd';

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
}) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <Checkbox.Group options={options} />
    </Form.Item>
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