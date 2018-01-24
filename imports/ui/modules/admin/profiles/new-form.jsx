import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row } from 'antd';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { Profiles } from '/imports/lib/collections/admin';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.profilesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const doc = {
        firstName: fieldsValue.firstName,
        lastName: fieldsValue.lastName,
        cnicNumber: fieldsValue.cnicNumber,
        address: fieldsValue.address
      };

      Meteor.call('admin/profiles.create', { doc }, (error, result) => {
        if (error) return;
        const { history } = this.props;
        history.push(paths.profilesPath);
      });
    });
  };

  getFirstNameField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please input a first name.'
      }
    ];
    return getFieldDecorator('firstName', { rules })(<Input placeholder="First name" />);
  }

  getLastNameField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please input a last name.'
      }
    ];
    return getFieldDecorator('lastName', { rules })(<Input placeholder="Last name" />);
  }

  getCnicNumberField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please input a CNIC number.'
      }
    ];
    return getFieldDecorator('cnicNumber', { rules })(<Input placeholder="CNIN number" />);
  }

  getAddressField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [];
    return getFieldDecorator('address', { rules })(
      <Input.TextArea rows={4} placeholder="Address" />
    );
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 }
    };

    const buttonItemLayout = {
      wrapperCol: { span: 14, offset: 4 }
    };

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <Form.Item label="First Name" {...formItemLayout}>
          {this.getFirstNameField()}
        </Form.Item>
        <Form.Item label="Last Name" {...formItemLayout}>
          {this.getLastNameField()}
        </Form.Item>
        <Form.Item label="CNIC Number" {...formItemLayout}>
          {this.getCnicNumberField()}
        </Form.Item>
        <Form.Item label="Address" {...formItemLayout}>
          {this.getAddressField()}
        </Form.Item>
        <Form.Item {...buttonItemLayout}>
          <Row type="flex" justify="end">
            <Button type="secondary" onClick={this.handleCancel}>
              Cancel
            </Button>
            &nbsp;
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Row>
        </Form.Item>
      </Form>
    );
  }
}

export default merge(Form.create(), WithBreadcrumbs(['Admin', 'Setup', 'Profiles', 'New']))(
  NewForm
);
