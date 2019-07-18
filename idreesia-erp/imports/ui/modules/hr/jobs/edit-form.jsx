import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    jobById: PropTypes.object,
    updateJob: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.jobsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, jobById, updateJob } = this.props;
    form.validateFields((err, { name, description }) => {
      if (err) return;

      updateJob({
        variables: {
          id: jobById._id,
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
    const { loading, jobById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Job Name"
          initialValue={jobById.name}
          required
          requiredMessage="Please input a name for the job."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          disabled
          fieldName="description"
          fieldLabel="Description"
          initialValue={jobById.description}
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query jobById($id: String!) {
    jobById(id: $id) {
      _id
      name
      description
    }
  }
`;

const formMutation = gql`
  mutation updateJob($id: String!, $name: String!, $description: String) {
    updateJob(id: $id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "updateJob",
    options: {
      refetchQueries: ["allJobs"],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { jobId } = match.params;
      return { variables: { id: jobId } };
    },
  }),
  WithBreadcrumbs(["HR", "Jobs", "Edit"])
)(EditForm);
