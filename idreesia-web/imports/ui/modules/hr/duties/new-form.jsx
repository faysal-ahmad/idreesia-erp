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

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createDuty: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.dutiesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createDuty, history } = this.props;
    form.validateFields((err, { name, description }) => {
      if (err) return;

      createDuty({
        variables: {
          name,
          description,
        },
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
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Duty Name"
          required
          requiredMessage="Please input a name for the duty."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createDuty($name: String!, $description: String) {
    createDuty(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "createDuty",
    options: {
      refetchQueries: ["allDuties"],
    },
  }),
  WithBreadcrumbs(["HR", "Duties", "New"])
)(NewForm);
