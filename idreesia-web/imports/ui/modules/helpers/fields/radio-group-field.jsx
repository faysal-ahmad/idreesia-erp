import React from "react";
import PropTypes from "prop-types";

import { Radio, Form } from "antd";

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
const RadioGroupField = ({
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  initialValue = null,
  options,
  required,
  requiredMessage,
}) => {
  const radioOptions = options.map(option => (
    <Radio key={option.value} value={option.value}>
      {option.label}
    </Radio>
  ));

  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <Radio.Group options={options}>{radioOptions}</Radio.Group>
    </Form.Item>
  );
}

RadioGroupField.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
};

export default RadioGroupField;