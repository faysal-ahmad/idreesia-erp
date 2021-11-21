import React from 'react';
import PropTypes from 'prop-types';

import { Select, Form } from '/imports/ui/controls';

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
}) => {
  const options = [];
  data.forEach(dataObj => {
    const value = getDataValue(dataObj);
    const text = getDataText(dataObj);
    options.push(
      <Select.Option key={value} value={value}>
        {text}
      </Select.Option>
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
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <Select
        placeholder={placeholder}
        onChange={onChange}
        allowClear={allowClear}
        mode={mode}
        dropdownMatchSelectWidth={dropdownMatchSelectWidth}
      >
        {options}
      </Select>
    </Form.Item>
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