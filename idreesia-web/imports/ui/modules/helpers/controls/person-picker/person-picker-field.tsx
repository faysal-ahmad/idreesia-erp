import React from 'react';
import { Form } from 'antd';

import PersonPickerInput, { type PersonPickerInputProps } from './person-picker-input';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

interface Props extends Omit<PersonPickerInputProps, 'value' | 'onChange'> {
  fieldName: string;
  fieldLabel?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: unknown;
  required?: boolean;
  requiredMessage?: string;
}

/** A Form.Item holding one person, picked from a person picker drawer. */
const PersonPickerField = ({
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  initialValue = null,
  required,
  requiredMessage,
  ...inputProps
}: Props) => (
  <Form.Item
    name={fieldName}
    label={fieldLabel}
    initialValue={initialValue}
    rules={[{ required, message: requiredMessage }]}
    {...fieldLayout}
  >
    <PersonPickerInput {...inputProps} />
  </Form.Item>
);

export default PersonPickerField;
