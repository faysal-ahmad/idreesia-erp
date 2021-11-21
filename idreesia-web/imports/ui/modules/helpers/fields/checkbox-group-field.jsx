import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Form } from '/imports/ui/controls';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

/**
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * fieldLayout: Layout settings for the form field.
 * initialValue: Initial value for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 */
const CheckboxGroupField = ({
  fieldName,
  fieldLabel,
  fieldLayout = formItemLayout,
  initialValue = [],
  options,
  required,
  requiredMessage,
}) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <Checkbox.Group options={options} />
    </Form.Item>
  );
}

CheckboxGroupField.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.array,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
};

export default CheckboxGroupField;