import React from 'react';
import PropTypes from 'prop-types';

import { Switch, Form } from 'antd';

const AntFormItem = (Form as any).Item;
const SwitchInput = Switch as any;
interface FieldProps { fieldName: string; fieldLabel?: string; fieldLayout?: Record<string, unknown>; initialValue?: boolean; disabled?: boolean; handleChange?(checked: boolean): void; }

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
    <AntFormItem name={fieldName} label={fieldLabel} valuePropName="checked" initialValue={initialValue} {...fieldLayout}>
      <SwitchInput
        disabled={disabled}
        onChange={(checked: boolean) => {
          if (handleChange) {
            handleChange(checked);
          }
        }}
      />
    </AntFormItem>
  );

SwitchField.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.bool,
  disabled: PropTypes.bool,
  handleChange: PropTypes.func,
};

export default SwitchField;