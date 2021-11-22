import React from 'react';
import PropTypes from 'prop-types';

import { Switch, Form } from 'antd';

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
  handleChange,
}) => (
    <Form.Item name={fieldName} label={fieldLabel} valuePropName="checked" initialValue={initialValue} {...fieldLayout}>
      <Switch
        onChange={checked => {
          if (handleChange) {
            handleChange(checked);
          }
        }}
      />
    </Form.Item>
  );

SwitchField.propTypes = {
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  fieldLayout: PropTypes.object,
  initialValue: PropTypes.bool,
  handleChange: PropTypes.func,
};

export default SwitchField;