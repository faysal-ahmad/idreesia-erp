import React from "react";
import PropTypes from "prop-types";
import { DatePicker, Form } from "antd";

const AntFormItem = (Form as any).Item;
const DateInput = DatePicker as any;
interface FieldProps { allowClear?: boolean; fieldName: string; fieldLabel?: string; fieldLayout?: Record<string, unknown>; initialValue?: unknown; required?: boolean; disabled?: boolean; requiredMessage?: string; }

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
const DateField = ({
  allowClear,
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  initialValue = null,
  required,
  disabled,
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
      <DateInput format="DD MMM, YYYY" allowClear={allowClear} disabled={disabled} />
    </AntFormItem>
  );
}

DateField.propTypes = {
  allowClear: PropTypes.bool,
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.object,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  requiredMessage: PropTypes.string,
};

export default DateField;