import React from "react";
import PropTypes from "prop-types";

import { Form } from "antd";
import Input from "./input";

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
const AntFormItem = Form.Item as any;
const StockItemInput = Input as any;

interface FieldProps {
  fieldName: string;
  fieldLabel?: string;
  placeholder?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: Record<string, unknown> | null;
  required?: boolean;
  requiredMessage?: string;
  disabled?: boolean;
  physicalStoreId?: string;
}

const Field = ({
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout,
  initialValue,
  required,
  requiredMessage,
  disabled,
  physicalStoreId,
}: FieldProps) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <AntFormItem name={fieldName} label={fieldLabel} rules={rules} initialValue={initialValue} {...fieldLayout}>
      <StockItemInput
        placeholder={placeholder}
        disabled={disabled}
        physicalStoreId={physicalStoreId}
      />
    </AntFormItem>
  );
};

Field.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.object,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
  disabled: PropTypes.bool,

  physicalStoreId: PropTypes.string,
};

Field.defaultProps = {
  initialValue: null,
  fieldLayout: formItemLayout,
};

export default Field;