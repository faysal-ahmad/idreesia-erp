import React from 'react';

import { Form } from 'antd';
import CustomInput from './input';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

interface Props {
  fieldName: string;
  fieldLabel?: string;
  placeholder?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: unknown;
  required?: boolean;
  requiredMessage?: string;
  disabled?: boolean;
}

const Field = ({
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  initialValue = null,
  required,
  requiredMessage,
  disabled,
}: Props) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <CustomInput
        placeholder={placeholder}
        disabled={disabled}
      />
    </Form.Item>
  );
};

export default Field;
