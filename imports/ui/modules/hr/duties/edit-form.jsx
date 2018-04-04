import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    dutyById: PropTypes.object,
    updateDuty: PropTypes.func
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.dutiesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, dutyById, updateDuty } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      updateDuty({
        variables: {
          id: dutyById._id,
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

  getNameField(duty) {
    const { getFieldDecorator } = this.props.form;
    const initialValue = duty.name;
    const rules = [
      {
        required: true,
        message: 'Please input a name for the duty.'
      }
    ];
    return getFieldDecorator('name', { initialValue, rules })(<Input placeholder="Duty name" />);
  }

  render() {
    const { loading, dutyById } = this.props;
    if (loading) return null;

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
          {this.getNameField(dutyById)}
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

const formQuery = gql`
  query dutyById($id: String!) {
    dutyById(id: $id) {
      _id
      name
    }
  }
`;

const formMutation = gql`
  mutation updateDuty($id: String!, $name: String!) {
    updateDuty(id: $id, name: $name) {
      _id
      name
    }
  }
`;

export default merge(
  Form.create(),
  graphql(formMutation, {
    name: 'updateDuty',
    options: {
      refetchQueries: ['allDuties']
    }
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { dutyId } = match.params;
      return { variables: { id: dutyId } };
    }
  }),
  WithBreadcrumbs(['HR', 'Setup', 'Duties', 'Edit'])
)(EditForm);
