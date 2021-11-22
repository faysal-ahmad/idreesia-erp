import React from "react";
import PropTypes from "prop-types";

import { Input, Form } from "antd";

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
const InputTextAreaField = ({
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  initialValue = null,
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
      <Input.TextArea placeholder={placeholder} />
    </Form.Item>
  );
}

InputTextAreaField.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.string,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
};

export default InputTextAreaField;