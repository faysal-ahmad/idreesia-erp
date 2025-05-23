import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { DatePicker, Form } from 'antd';

const { RangePicker } = DatePicker;

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
const DateRangeField = ({
  allowClear,
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  initialValue = [dayjs(), dayjs()],
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
      <RangePicker format="DD MMM, YYYY" allowClear={allowClear} />
    </Form.Item>
  );
}

DateRangeField.propTypes = {
  allowClear: PropTypes.bool,
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.array,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
};

export default DateRangeField;
