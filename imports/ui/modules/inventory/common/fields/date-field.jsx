import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DatePicker, Form } from 'antd';
import { get } from 'lodash';
import moment from 'moment';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 }
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
export default class DateField extends Component {
  static propTypes = {
    fieldName: PropTypes.string,
    fieldLabel: PropTypes.string,
    placeholder: PropTypes.string,
    fieldLayout: PropTypes.object,
    initialValue: PropTypes.object,
    required: PropTypes.bool,
    requiredMessage: PropTypes.string,
    getFieldDecorator: PropTypes.func
  };

  static defaultProps = {
    initialValue: moment(),
    fieldLayout: formItemLayout
  };

  getField() {
    const { fieldName, required, requiredMessage, getFieldDecorator, initialValue } = this.props;
    const rules = [
      {
        required,
        message: requiredMessage
      }
    ];

    return getFieldDecorator(fieldName, { initialValue, rules })(
      <DatePicker format="DD MMM, YYYY" />
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
