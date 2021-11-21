import React from 'react';
import PropTypes from 'prop-types';
import InputMask from 'react-input-mask';

import { Input, Form } from '/imports/ui/controls';

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
const InputMobileField = ({
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  initialValue = '',
  required = false,
  requiredMessage,
  disabled,
}) => {
  const rules = [
    {
      required,
      message: required ? requiredMessage : '',
      // pattern: /^[0-9+]{4}-[0-9+]{7}$/,
    },
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      {
        disabled ? (
          <Input disabled />
        ) : (
          <InputMask mask="9999-9999999" placeholder={placeholder} />
        )
      }
    </Form.Item>
  );
}

InputMobileField.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.string,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
  disabled: PropTypes.bool,
};

export default InputMobileField;
