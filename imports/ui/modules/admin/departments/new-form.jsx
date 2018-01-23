import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row } from 'antd';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { Departments } from '/imports/lib/collections/admin';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.departmentsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const doc = {
        name: fieldsValue.name,
        description: fieldsValue.description
      };

      Meteor.call('admin/departments.create', { doc }, (error, result) => {
        if (error) return;
        const { history } = this.props;
        history.push(paths.departmentsPath);
      });
    });
  };

  getNameField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please input a name for the department.'
      }
    ];
    return getFieldDecorator('name', { rules })(<Input placeholder="Department name" />);
  }

  getDescriptionField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [];
    return getFieldDecorator('description', { rules })(
      <Input.TextArea rows={5} placeholder="Department description" />
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
        <Form.Item label="Name" {...formItemLayout}>
          {this.getNameField()}
        </Form.Item>
        <Form.Item label="Description" {...formItemLayout}>
          {this.getDescriptionField()}
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

export default merge(Form.create(), WithBreadcrumbs(['Admin', 'Setup', 'Departments', 'New']))(
  NewForm
);
