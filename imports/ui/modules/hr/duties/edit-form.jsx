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
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { loading, dutyById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Duty Name"
          initialValue={dutyById.name}
          required={true}
          requiredMessage="Please input a name for the duty."
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
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
