import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form } from "antd";

import { InputFile } from "../controls";

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
export default class InputFileField extends Component {
  static propTypes = {
    accept: PropTypes.string,
    fieldName: PropTypes.string,
    fieldLabel: PropTypes.string,
    fieldLayout: PropTypes.object,
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
      accept,
      fieldName,
      required,
      requiredMessage,
      getFieldDecorator,
    } = this.props;

    const rules = [
      {
        required,
        message: requiredMessage,
      },
    ];

    return getFieldDecorator(fieldName, { rules })(
      <InputFile accept={accept} />
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
