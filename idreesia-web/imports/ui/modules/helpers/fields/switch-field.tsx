import React from 'react';
import { Switch, Form } from 'antd';

interface FieldProps {
  fieldName: string;
  fieldLabel?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: boolean;
  disabled?: boolean;
  handleChange?(checked: boolean): void;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

/**
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * fieldLayout: Layout settings for the form field.
 * initialValue: Initial value for the form field.
 */
const SwitchField = ({
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  initialValue = false,
  disabled = false,
  handleChange,
}: FieldProps) => (
    <Form.Item name={fieldName} label={fieldLabel} valuePropName="checked" initialValue={initialValue} {...fieldLayout}>
      <Switch
        disabled={disabled}
        onChange={(checked: boolean) => {
          if (handleChange) {
            handleChange(checked);
          }
        }}
      />
    </Form.Item>
  );

export default SwitchField;
