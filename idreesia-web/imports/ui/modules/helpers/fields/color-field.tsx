import React from 'react';

import { ColorPicker, Form } from 'antd';
import { type Color } from 'antd/es/color-picker';

interface FieldProps {
  initialValue?: string | null;
  fieldLayout?: Record<string, unknown>;
  fieldName: string;
  fieldLabel?: string;
  required?: boolean;
  requiredMessage?: string;
}

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
 * initialValue: Initial value (hex string) to set in the form field.
 */
function ColorField({
  initialValue = null,
  fieldLayout = formItemLayout,
  fieldName,
  fieldLabel,
  required,
  requiredMessage,
}: FieldProps) {
  const rules = required
    ? [
        {
          required,
          message: requiredMessage,
        },
      ]
    : undefined;

  return (
    <Form.Item
      name={fieldName}
      label={fieldLabel}
      initialValue={initialValue}
      rules={rules}
      getValueFromEvent={(color: Color | string) =>
        typeof color === 'string' ? color : color.toHexString()
      }
      {...fieldLayout}
    >
      <ColorPicker showText />
    </Form.Item>
  );
}

export default ColorField;
