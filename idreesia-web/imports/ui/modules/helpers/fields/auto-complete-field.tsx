import React from "react";
import PropTypes from "prop-types";

import { AutoComplete, Form } from "antd";

const AntFormItem = (Form as any).Item;
const AutoCompleteInput = AutoComplete as any;
interface FieldProps { dataSource?: string[]; fieldName: string; fieldLabel?: string; placeholder?: string; fieldLayout?: Record<string, unknown>; required?: boolean; requiredMessage?: string; initialValue?: string | null; filterOption?(inputValue: string, option: any): boolean; }

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const filterOptionFunc = (_inputValue: string, option: any) => {
  const key = option.key.toLowerCase();
  const inputValue = _inputValue.toLowerCase();
  if (key.startsWith(inputValue)) return true;
  return false;
};

/**
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * placeholder: Placeholder text to show in the form field.
 * fieldLayout: Layout settings for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 */
const AutoCompleteField = ({
  dataSource = [],
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  required,
  requiredMessage,
  initialValue = null,
  filterOption = filterOptionFunc,
}: FieldProps) => {
  const rules = required
    ? [
        {
          required,
          message: requiredMessage,
        },
      ]
    : null;

  return (
    <AntFormItem name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <AutoCompleteInput
        placeholder={placeholder}
        dataSource={dataSource}
        backfill
        filterOption={filterOption}
      />
    </AntFormItem>
  );
}

AutoCompleteField.propTypes = {
  dataSource: PropTypes.array,
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
  initialValue: PropTypes.string,
  filterOption: PropTypes.func,
};

export default AutoCompleteField;