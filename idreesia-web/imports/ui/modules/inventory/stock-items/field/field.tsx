import React from 'react';
import { Form } from 'antd';

import Input from './input';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

interface StockItemValue {
  _id?: string;
  formattedName?: string | null;
}

interface Props {
  fieldName: string;
  fieldLabel?: string;
  placeholder?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: StockItemValue | null;
  required?: boolean;
  requiredMessage?: string;
  disabled?: boolean;
  physicalStoreId?: string;
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
  physicalStoreId,
}: Props) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item
      name={fieldName}
      label={fieldLabel}
      rules={rules}
      initialValue={initialValue}
      {...fieldLayout}
    >
      <Input
        placeholder={placeholder}
        disabled={disabled}
        physicalStoreId={physicalStoreId}
      />
    </Form.Item>
  );
};

export default Field;
