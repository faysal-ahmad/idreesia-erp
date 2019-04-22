import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";
import {
  TimeField,
  InputTextField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createDutyShift: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.dutyShiftsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createDutyShift, history } = this.props;
    form.validateFields((err, { name, startTime, endTime }) => {
      if (err) return;

      createDutyShift({
        variables: {
          name,
          startTime,
          endTime,
        },
      })
        .then(() => {
          history.push(paths.dutyShiftsPath);
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
          requiredMessage="Please input a name for the duty shift."
          getFieldDecorator={getFieldDecorator}
        />
        <TimeField
          fieldName="startTime"
          fieldLabel="Start Time"
          getFieldDecorator={getFieldDecorator}
        />

        <TimeField
          fieldName="endTime"
          fieldLabel="End Time"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createDutyShift(
    $name: String!
    $startTime: String
    $endTime: String
  ) {
    createDutyShift(name: $name, startTime: $startTime, endTime: $endTime) {
      _id
      name
      startTime
      endTime
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "createDutyShift",
    options: {
      refetchQueries: ["allDutyShifts"],
    },
  }),
  WithBreadcrumbs(["HR", "Setup", "Duty Shifts", "New"])
)(NewForm);
