import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createJob: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.jobsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createJob, history } = this.props;
    form.validateFields((err, { name, description }) => {
      if (err) return;

      createJob({
        variables: {
          name,
          description,
        },
      })
        .then(() => {
          history.push(paths.jobsPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { isFieldsTouched } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Job Name"
          required
          requiredMessage="Please input a name for the job."
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
        />
        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createJob($name: String!, $description: String) {
    createJob(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'createJob',
    options: {
      refetchQueries: ['allJobs'],
    },
  }),
  WithBreadcrumbs(['HR', 'Jobs', 'New'])
)(NewForm);
