import React from "react";
import PropTypes from "prop-types";

import { Form } from "antd";
import Input from "./input";

const AntFormItem = (Form as any).Item;
const SelectionInput = Input as any;
interface FieldProps { fieldName: string; fieldLabel?: string; fieldLayout?: Record<string, unknown>; placeholder?: string; disabled?: boolean; required?: boolean; requiredMessage?: string; initialValue?: unknown; predefinedFilterName?: string; predefinedFilterStoreId?: string; }

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
const Field = ({
  fieldName,
  fieldLabel,
  fieldLayout,
  placeholder,
  disabled,
  required,
  requiredMessage,
  initialValue,
  predefinedFilterName,
  predefinedFilterStoreId,
}: FieldProps) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <AntFormItem name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <SelectionInput
        placeholder={placeholder}
        disabled={disabled}
        predefinedFilterName={predefinedFilterName}
        predefinedFilterStoreId={predefinedFilterStoreId}
      />
      </AntFormItem>
  );
}

Field.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.object,
  predefinedFilterName: PropTypes.string,
  predefinedFilterStoreId: PropTypes.string,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
  disabled: PropTypes.bool,
};

Field.defaultProps = {
  initialValue: null,
  fieldLayout: formItemLayout,
};

export default Field;