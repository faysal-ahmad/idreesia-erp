import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { Profiles } from '/imports/lib/collections/admin';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    profile: PropTypes.object
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

      const { profile } = this.props;
      const doc = Object.assign({}, profile, {
        firstName: fieldsValue.firstName,
        lastName: fieldsValue.lastName,
        cnicNumber: fieldsValue.cnicNumber,
        address: fieldsValue.address
      });

      Meteor.call('admin/profiles.update', { doc }, (error, result) => {
        if (error) return;
        const { history } = this.props;
        history.push(paths.profilesPath);
      });
    });
  };

  getFirstNameField() {
    const { profile } = this.props;
    const { getFieldDecorator } = this.props.form;
    const initialValue = profile.firstName;
    const rules = [
      {
        required: true,
        message: 'Please input a first name.'
      }
    ];
    return getFieldDecorator('firstName', { initialValue, rules })(
      <Input placeholder="First name" />
    );
  }

  getLastNameField() {
    const { profile } = this.props;
    const { getFieldDecorator } = this.props.form;
    const initialValue = profile.lastName;
    const rules = [
      {
        required: true,
        message: 'Please input a last name.'
      }
    ];
    return getFieldDecorator('lastName', { initialValue, rules })(
      <Input placeholder="Last name" />
    );
  }

  getCnicNumberField() {
    const { profile } = this.props;
    const { getFieldDecorator } = this.props.form;
    const initialValue = profile.cnicNumber;
    const rules = [
      {
        required: true,
        message: 'Please input a CNIC number.'
      }
    ];
    return getFieldDecorator('cnicNumber', { initialValue, rules })(
      <Input placeholder="CNIC Number" />
    );
  }

  getAddressField() {
    const { profile } = this.props;
    const { getFieldDecorator } = this.props.form;
    const initialValue = profile.address;
    const rules = [];
    return getFieldDecorator('address', { initialValue, rules })(
      <Input.TextArea rows={4} placeholder="Address" />
    );
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 }
    };

    const buttonItemLayout = {
      wrapperCol: { span: 14, offset: 6 }
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

function dataLoader(props, onData) {
  const { match } = props;
  const { profileId } = match.params;
  const subscription = Meteor.subscribe('admin/profiles#byId', { id: profileId });
  if (subscription.ready()) {
    const profile = Profiles.findOne(profileId);
    onData(null, { profile });
  }
}

export default merge(
  Form.create(),
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Admin', 'Setup', 'Profiles', 'Edit'])
)(EditForm);
