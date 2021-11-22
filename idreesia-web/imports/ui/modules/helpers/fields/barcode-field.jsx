import React from "react";
import PropTypes from "prop-types";

import { Form } from "antd";
import { DisplayBarcode } from "../controls";

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
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
const BarcodeField = ({
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  initialValue = "",
  required,
  requiredMessage,
  disabled,
}) => {
    const rules = [
      {
        required,
        message: requiredMessage,
      },
    ];
    
  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <DisplayBarcode disabled={disabled} placeholder={placeholder} />
    </Form.Item>
  );
}

BarcodeField.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.any,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
  disabled: PropTypes.bool,
};

export default BarcodeField;
