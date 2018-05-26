import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Switch, Form } from 'antd';
import { get } from 'lodash';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 }
};

/**
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * fieldLayout: Layout settings for the form field.
 * initialValue: Initial value for the form field.
 */
export default class InputTextField extends Component {
  static propTypes = {
    fieldName: PropTypes.string,
    fieldLabel: PropTypes.string,
    fieldLayout: PropTypes.object,
    initialValue: PropTypes.bool,
    getFieldDecorator: PropTypes.func
  };

  static defaultProps = {
    initialValue: false,
    fieldLayout: formItemLayout
  };

  getField() {
    const { fieldName, placeholder, getFieldDecorator, initialValue } = this.props;

    return getFieldDecorator(fieldName, { initialValue })(<Switch defaultChecked={initialValue} />);
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
