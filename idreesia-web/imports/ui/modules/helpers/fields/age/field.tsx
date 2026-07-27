import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { Form } from 'antd';
import Input from './input';

const AntFormItem = (Form as any).Item;
const CustomInput = Input as any;
interface FieldProps { fieldName: string; fieldLabel?: string; fieldLayout?: Record<string, unknown>; initialValue?: unknown; required?: boolean; requiredMessage?: string; }

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
const Field = ({
  fieldName,
  fieldLabel,
  fieldLayout,
  initialValue,
  required,
  requiredMessage,
}: FieldProps) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <AntFormItem name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <CustomInput />
    </AntFormItem>
  );
}

Field.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.object,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
};

Field.defaultProps = {
  initialValue: dayjs().startOf('day'),
  fieldLayout: formItemLayout,
};

export default Field;