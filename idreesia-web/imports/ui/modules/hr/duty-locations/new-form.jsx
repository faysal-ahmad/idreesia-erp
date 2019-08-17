import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";
import {
  InputTextField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createDutyLocation: PropTypes.func,
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
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the duty location."
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
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

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: "createDutyLocation",
    options: {
      refetchQueries: ["allDutyLocations"],
    },
  }),
  WithBreadcrumbs(["HR", "Setup", "Duty Locations", "New"])
)(NewForm);
