import React from 'react';
import PropTypes from 'prop-types';

import { Form } from 'antd';
import CustomInput from './input';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

/**
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * fieldLayout: Layout settings for the form field.
 * initialValue: Initial value for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 */
const AntFormItem = (Form as any).Item;
const DurationInput = CustomInput as any;
interface Props { fieldName: string; fieldLabel?: string; fieldLayout?: Record<string, unknown>; initialValue?: string | null; required?: boolean; requiredMessage?: string; }

const Field = ({
  fieldName,
  fieldLabel,
  fieldLayout,
  initialValue,
  required,
  requiredMessage,
}: Props) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <AntFormItem name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <DurationInput />
    </AntFormItem>
  );
}

Field.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.string,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
};

Field.defaultProps = {
  initialValue: null,
  fieldLayout: formItemLayout,
};

export default Field;