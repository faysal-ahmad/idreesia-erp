import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputMask from 'react-input-mask';

import { Input, Form } from '/imports/ui/controls';

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
export default class InputMobileField extends Component {
  static propTypes = {
    fieldName: PropTypes.string,
    fieldLabel: PropTypes.string,
    placeholder: PropTypes.string,
    fieldLayout: PropTypes.object,
    initialValue: PropTypes.string,
    required: PropTypes.bool,
    requiredMessage: PropTypes.string,
    disabled: PropTypes.bool,
    getFieldDecorator: PropTypes.func,
  };

  static defaultProps = {
    initialValue: '',
    required: false,
    fieldLayout: formItemLayout,
  };

  getField() {
    const {
      fieldName,
      placeholder,
      required,
      requiredMessage,
      getFieldDecorator,
      initialValue,
      disabled,
    } = this.props;

    if (!disabled) {
      const rules = [
        {
          required,
          message: required ? requiredMessage : '',
          // pattern: /^[0-9+]{4}-[0-9+]{7}$/,
        },
      ];

      return getFieldDecorator(fieldName, {
        initialValue: initialValue || '',
        rules,
      })(<InputMask mask="9999-9999999" placeholder={placeholder} />);
    }

    return getFieldDecorator(fieldName, { initialValue: initialValue || '' })(
      <Input disabled />
    );
  }

  render() {
    const { fieldLabel, fieldLayout } = this.props;
    return (
      <Form.Item label={fieldLabel} {...fieldLayout}>
        {this.getField()}
      </Form.Item>
    );
  }
}
