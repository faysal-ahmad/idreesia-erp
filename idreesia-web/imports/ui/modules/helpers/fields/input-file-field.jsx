import React from "react";
import PropTypes from "prop-types";

import { Form } from "/imports/ui/controls";
import { InputFile } from "../controls";

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
const InputFileField = ({
  accept,
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
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
    <Form.Item name={fieldName} label={fieldLabel} rules={rules} {...fieldLayout}>
      <InputFile accept={accept} />
    </Form.Item>
  );
}

InputFileField.propTypes = {
  accept: PropTypes.string,
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldLayout: PropTypes.object,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
};

export default InputFileField;