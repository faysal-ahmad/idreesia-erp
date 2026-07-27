import React from 'react';
import PropTypes from 'prop-types';

import { Select, Form } from 'antd';

const AntFormItem = (Form as any).Item;
const AntSelect = Select as any;
type OptionValue = string | number;
type DataRecord = Record<string, any>;
interface FieldProps { allowClear?: boolean; dropdownMatchSelectWidth?: boolean; mode?: string; data?: DataRecord[]; getDataValue?(data: DataRecord): OptionValue; getDataText?(data: DataRecord): React.ReactNode; initialValue?: string | string[] | null; fieldLayout?: Record<string, unknown>; fieldName: string; fieldLabel?: string; placeholder?: string; required?: boolean; requiredMessage?: string; onChange?(value: unknown): void; }

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

/**
 * data: Array of objects (containing text and value)
 * getDataValue: Function that returns the "value" from the above data object
 * getDataText: Function that returns the "text" from the above data object
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * placeholder: Placeholder text to show in the form field.
 * fieldLayout: Layout settings for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 * initialValue: Initial values to set in the form field.
 * handleValueChanged: Callback for whenever the selected value changes.
 */
const SelectField = ({
  allowClear = true,
  dropdownMatchSelectWidth = true,
  mode = 'default',
  data = [],
  getDataValue = ({ _id }) => _id,
  getDataText = ({ name }) => name,
  initialValue = null,
  fieldLayout = formItemLayout,
  fieldName,
  fieldLabel,
  placeholder,
  required,
  requiredMessage,
  onChange,
}: FieldProps) => {
  const options: React.ReactNode[] = [];
  data.forEach((dataObj: DataRecord) => {
    const value = getDataValue(dataObj);
    const text = getDataText(dataObj);
    options.push(
      <AntSelect.Option key={value} value={value}>
        {text}
      </AntSelect.Option>
    );
  });

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
      <AntSelect
        placeholder={placeholder}
        onChange={onChange}
        allowClear={allowClear}
        mode={mode}
        dropdownMatchSelectWidth={dropdownMatchSelectWidth}
      >
        {options}
      </AntSelect>
    </AntFormItem>
  );
}

SelectField.propTypes = {
  allowClear: PropTypes.bool,
  dropdownMatchSelectWidth: PropTypes.bool,
  mode: PropTypes.string,
  data: PropTypes.array,
  getDataValue: PropTypes.func,
  getDataText: PropTypes.func,
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
  initialValue: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onChange: PropTypes.func,
};

export default SelectField;