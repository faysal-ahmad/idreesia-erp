import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Icon, Input, Button, message } from 'antd';

const loginFormButtonStyle = {
  width: '100%',
};

class LoginForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
  };

  handleSubmit = e => {
    const { history, location, form } = this.props;
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        const { userName, password } = values;
        Meteor.loginWithPassword(userName, password, error => {
          if (!error) {
            history.push(location.pathname);
            // eslint-disable-next-line no-console
            console.log(`Login successful. Routing to ${location.pathname}`);
          } else {
            message.error(error.message, 5);
          }
        });
      }
    });
  };

  getUserNameField() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const rules = [
      {
        required: true,
        message: 'Please input your username.',
      },
    ];
    return getFieldDecorator('userName', { rules })(
      <Input
        placeholder="Username"
        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
      />
    );
  }

  getPasswordField() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const rules = [
      {
        required: true,
        message: 'Please input your password.',
      },
    ];
    return getFieldDecorator('password', { rules })(
      <Input
        type="password"
        placeholder="Password"
        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
      />
    );
  }

  render() {
    const itemLayout = {
      wrapperCol: { span: 14 },
    };

    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Item {...itemLayout}>{this.getUserNameField()}</Form.Item>
        <Form.Item {...itemLayout}>{this.getPasswordField()}</Form.Item>
        <Form.Item {...itemLayout}>
          <Button type="primary" htmlType="submit" style={loginFormButtonStyle}>
            Log in
          </Button>
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create()(LoginForm);
