import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form, Input } from './antd-controls';

class ChangePasswordForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
  };

  getOldPasswordField() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const rules = [
      {
        required: true,
        message: 'Please input your old password.',
      },
    ];
    return getFieldDecorator('oldPassword', { rules })(
      <Input type="password" placeholder="Old Password" />
    );
  }

  getNewPasswordField() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const rules = [
      {
        required: true,
        message: 'Please input your new password.',
      },
    ];
    return getFieldDecorator('newPassword', { rules })(
      <Input type="password" placeholder="New Password" />
    );
  }

  render() {
    const itemLayout = {
      wrapperCol: { span: 14 },
    };

    return (
      <Form>
        <Form.Item {...itemLayout}>{this.getOldPasswordField()}</Form.Item>
        <Form.Item {...itemLayout}>{this.getNewPasswordField()}</Form.Item>
      </Form>
    );
  }
}

export default Form.create()(ChangePasswordForm);
