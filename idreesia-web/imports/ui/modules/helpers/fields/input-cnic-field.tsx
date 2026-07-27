import React from 'react';
import PropTypes from 'prop-types';
import InputMask from 'react-input-mask';

import { Input, Form } from 'antd';

const AntFormItem = (Form as any).Item;
const TextInput = Input as any;
const MaskedInput = InputMask as any;
interface FieldProps { fieldName: string; fieldLabel?: string; placeholder?: string; fieldLayout?: Record<string, unknown>; initialValue?: unknown; required?: boolean; requiredMessage?: string; disabled?: boolean; }

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
const InputCnicField = ({
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  initialValue = '',
  required = false,
  requiredMessage,
  disabled,
}: FieldProps) => {
  const rules = [
    {
      required,
      message: required ? requiredMessage : '',
      // pattern: /^[0-9+]{5}-[0-9+]{7}-[0-9]{1}$/,
    },
  ];

  return (
    <AntFormItem name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      {
        disabled ? (
          <TextInput disabled />
        ) : (
          <MaskedInput mask="99999-9999999-9" placeholder={placeholder} />
        )
      }
    </AntFormItem>
  );
}

InputCnicField.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.any,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
  disabled: PropTypes.bool,
};

export default InputCnicField;