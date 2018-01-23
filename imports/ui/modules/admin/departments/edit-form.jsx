import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { Departments } from '/imports/lib/collections/admin';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    department: PropTypes.object
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

      const { department } = this.props;
      const doc = Object.assign({}, department, {
        name: fieldsValue.name,
        description: fieldsValue.description
      });

      Meteor.call('admin/departments.update', { doc }, (error, result) => {
        if (error) return;
        const { history } = this.props;
        history.push(paths.departmentsPath);
      });
    });
  };

  getNameField() {
    const { department } = this.props;
    const { getFieldDecorator } = this.props.form;
    const initialValue = department.name;
    const rules = [
      {
        required: true,
        message: 'Please input a name for the department.'
      }
    ];
    return getFieldDecorator('name', { initialValue, rules })(
      <Input placeholder="Department name" />
    );
  }

  getDescriptionField() {
    const { department } = this.props;
    const { getFieldDecorator } = this.props.form;
    const initialValue = department.description;
    const rules = [];
    return getFieldDecorator('description', { initialValue, rules })(
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

function dataLoader(props, onData) {
  const { match } = props;
  const { departmentId } = match.params;
  const subscription = Meteor.subscribe('admin/departments#byId', { id: departmentId });
  if (subscription.ready()) {
    const department = Departments.findOne(departmentId);
    onData(null, { department });
  }
}

export default merge(
  Form.create(),
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Admin', 'Setup', 'Departments', 'Edit'])
)(EditForm);
