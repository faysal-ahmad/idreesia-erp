import React from "react";
import PropTypes from "prop-types";

import { Form } from "antd";
import { InputFile } from "../controls";

const AntFormItem = (Form as any).Item;
const FileInput = InputFile as any;
interface FieldProps { accept?: string; fieldName: string; fieldLabel?: string; fieldLayout?: Record<string, unknown>; required?: boolean; requiredMessage?: string; }

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
 */
const InputFileField = ({
  accept,
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
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
    <AntFormItem name={fieldName} label={fieldLabel} rules={rules} {...fieldLayout}>
      <FileInput accept={accept} />
    </AntFormItem>
  );
}

InputFileField.propTypes = {
  accept: PropTypes.string,
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldLayout: PropTypes.object,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
};

export default InputFileField;