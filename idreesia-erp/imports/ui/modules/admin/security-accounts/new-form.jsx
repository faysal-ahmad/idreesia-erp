import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { AdminSubModulePaths as paths } from "/imports/ui/modules/admin";
import {
  InputTextField,
  SelectField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createAccount: PropTypes.func,
    allKarkunsWithNoAccounts: PropTypes.array,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.accountsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createAccount, history } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      createAccount({
        variables: {
          karkunId: fieldsValue.karkunId,
          userName: fieldsValue.userName,
          password: fieldsValue.password,
        },
      })
        .then(() => {
          history.push(paths.accountsPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { allKarkunsWithNoAccounts } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <SelectField
          data={allKarkunsWithNoAccounts}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="karkunId"
          fieldLabel="Karkun Name"
          required
          requiredMessage="Please select a karkun for creating the account."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          required
          requiredMessage="Please specify a user name."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="password"
          fieldLabel="Password"
          type="password"
          required
          requiredMessage="Please specify a password."
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createAccount(
    $karkunId: String!
    $userName: String!
    $password: String!
  ) {
    createAccount(
      karkunId: $karkunId
      userName: $userName
      password: $password
    ) {
      _id
    }
  }
`;

const listQuery = gql`
  query allKarkunsWithNoAccounts {
    allKarkunsWithNoAccounts {
      _id
      name
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "createAccount",
    options: {
      refetchQueries: ["allkarkunsWithAccounts"],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  WithBreadcrumbs(["Admin", "Setup", "Account", "New"])
)(NewForm);
