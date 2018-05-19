import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createDutyLocation: PropTypes.func
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.dutyLocationsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createDutyLocation, history } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      createDutyLocation({
        variables: {
          name: fieldsValue.name
        }
      })
        .then(() => {
          history.push(paths.dutyLocationsPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  getNameField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please input a name for the duty location.'
      }
    ];
    return getFieldDecorator('name', { rules })(<Input placeholder="Duty location name" />);
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
        <Form.Item {...buttonItemLayout}>
          <Row type="flex" justify="end">
            <Button type="secondary" onClick={this.handleCancel}>
              Cancel
            </Button>
            &nbsp;
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Row>
        </Form.Item>
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createDutyLocation($name: String!) {
    createDutyLocation(name: $name) {
      _id
      name
    }
  }
`;

export default merge(
  Form.create(),
  graphql(formMutation, {
    name: 'createDutyLocation',
    options: {
      refetchQueries: ['allDutyLocations']
    }
  }),
  WithBreadcrumbs(['Inventory', 'Setup', 'Duty Locations', 'New'])
)(NewForm);
