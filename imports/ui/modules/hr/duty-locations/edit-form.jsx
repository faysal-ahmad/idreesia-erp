import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import { InputTextField, FormButtonsSaveCancel } from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    dutyLocationById: PropTypes.object,
    updateDutyLocation: PropTypes.func,
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
          name: fieldsValue.name,
        },
      })
        .then(() => {
          history.push(paths.dutyLocationsPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { loading, dutyLocationById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={dutyLocationById.name}
          required
          requiredMessage="Please input a name for the duty location."
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
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
      refetchQueries: ['allDutyLocations'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { dutyLocationId } = match.params;
      return { variables: { id: dutyLocationId } };
    },
  }),
  WithBreadcrumbs(['HR', 'Setup', 'Duty Locations', 'Edit'])
)(EditForm);
