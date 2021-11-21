import React from 'react';
import PropTypes from 'prop-types';
import { Cascader, Form } from '/imports/ui/controls';

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
const CascaderField = ({
  data,
  changeOnSelect = true,
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  initialValue = null,
  required,
  requiredMessage,
  disabled,
}) => {
  const rules = [
    {
      required,
      message: requiredMessage,
    },
  ];

  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
        <Cascader
          disabled={disabled}
          options={data}
          placeholder={placeholder}
          expandTrigger="hover"
          changeOnSelect={changeOnSelect}
        />
    </Form.Item>
  );
}

CascaderField.propTypes = {
  data: PropTypes.array,
  changeOnSelect: PropTypes.bool,
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.any,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
  disabled: PropTypes.bool,
};

export default CascaderField;