import React, { Component } from "react";
import PropTypes from "prop-types";
import { InputNumber, Form } from "antd";

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
export default class InputNumberField extends Component {
  static propTypes = {
    fieldName: PropTypes.string,
    fieldLabel: PropTypes.string,
    placeholder: PropTypes.string,
    fieldLayout: PropTypes.object,
    initialValue: PropTypes.number,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    required: PropTypes.bool,
    requiredMessage: PropTypes.string,
    disabled: PropTypes.bool,
    getFieldDecorator: PropTypes.func,
  };

  static defaultProps = {
    initialValue: null,
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
      minValue,
      maxValue,
      disabled,
    } = this.props;

    const additionalProps = {};
    if (minValue) additionalProps.min = minValue;
    if (maxValue) additionalProps.max = maxValue;

    if (!disabled) {
      const rules = [
        {
          required,
          message: requiredMessage,
        },
      ];

      return getFieldDecorator(fieldName, { initialValue, rules })(
        <InputNumber placeholder={placeholder} {...additionalProps} />
      );
    }

    return getFieldDecorator(fieldName, { initialValue })(
      <InputNumber disabled={disabled} />
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
