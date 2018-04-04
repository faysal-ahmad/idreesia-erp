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

    dutyLocationById: PropTypes.object,
    updateDutyLocation: PropTypes.func
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.dutyLocationsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, dutyLocationById, updateDutyLocation } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      updateDutyLocation({
        variables: {
          id: dutyLocationById._id,
          name: fieldsValue.name
        }
      })
        .then(() => {
          history.push(paths.dutyLocationsPath);
        })
        .catch(error => {
          console.log(error);
        });
    });
  };

  getNameField(dutyLocation) {
    const { getFieldDecorator } = this.props.form;
    const initialValue = dutyLocation.name;
    const rules = [
      {
        required: true,
        message: 'Please input a name for the duty location.'
      }
    ];
    return getFieldDecorator('name', { initialValue, rules })(
      <Input placeholder="Duty location name" />
    );
  }

  render() {
    const { loading, dutyLocationById } = this.props;
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
          {this.getNameField(dutyLocationById)}
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
  query dutyLocationById($id: String!) {
    dutyLocationById(id: $id) {
      _id
      name
    }
  }
`;

const formMutation = gql`
  mutation updateDutyLocation($id: String!, $name: String!) {
    updateDutyLocation(id: $id, name: $name) {
      _id
      name
    }
  }
`;

export default merge(
  Form.create(),
  graphql(formMutation, {
    name: 'updateDutyLocation',
    options: {
      refetchQueries: ['allDutyLocations']
    }
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { dutyLocationId } = match.params;
      return { variables: { id: dutyLocationId } };
    }
  }),
  WithBreadcrumbs(['HR', 'Setup', 'Duty Locations', 'Edit'])
)(EditForm);
