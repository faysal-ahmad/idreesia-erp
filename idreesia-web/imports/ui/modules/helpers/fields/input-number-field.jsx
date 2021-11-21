import React from 'react';
import PropTypes from 'prop-types';

import { InputNumber, Form } from '/imports/ui/controls';

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
const InputNumberField = ({
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  initialValue = null,
  minValue,
  maxValue,
  precision,
  required,
  requiredMessage,
  disabled,
}) => {
  const additionalProps = {};
  if (minValue || minValue === 0) additionalProps.min = minValue;
  if (maxValue) additionalProps.max = maxValue;
  if (precision) additionalProps.precision = precision;

  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} rules={rules} initialValue={initialValue} {...fieldLayout}>
        <InputNumber disabled={disabled} placeholder={placeholder} {...additionalProps} />
    </Form.Item>
  );
}

InputNumberField.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.number,
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  precision: PropTypes.number,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
  disabled: PropTypes.bool,
};

export default InputNumberField;