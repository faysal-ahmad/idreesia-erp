import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createDuty: PropTypes.func
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.dutiesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createDuty, history } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      createDuty({
        variables: {
          name: fieldsValue.name
        }
      })
        .then(() => {
          history.push(paths.dutiesPath);
        })
        .catch(error => {
          console.log(error);
        });
    });
  };

  getNameField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please input a name for the duty.'
      }
    ];
    return getFieldDecorator('name', { rules })(<Input placeholder="Duty name" />);
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
  mutation createDuty($name: String!) {
    createDuty(name: $name) {
      _id
      name
    }
  }
`;

export default merge(
  Form.create(),
  graphql(formMutation, {
    name: 'createDuty',
    options: {
      refetchQueries: ['allDuties']
    }
  }),
  WithBreadcrumbs(['Inventory', 'Setup', 'Duties', 'New'])
)(NewForm);
