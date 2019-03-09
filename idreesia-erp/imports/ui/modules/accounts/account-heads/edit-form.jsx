import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { WithAccountHeadId, WithAccountHeadById } from "./composers";
import { WithCompanyId } from "/imports/ui/modules/accounts/common/composers";
import { AccountsSubModulePaths as paths } from "/imports/ui/modules/accounts";
import {
  InputTextField,
  InputTextAreaField,
  InputNumberField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    companyId: PropTypes.string,
    accountHeadByIdLoading: PropTypes.bool,
    accountHeadById: PropTypes.object,
    updateAccountHead: PropTypes.func,
  };

  handleCancel = () => {
    const { history, companyId } = this.props;
    history.push(paths.accountHeadsPath(companyId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      companyId,
      accountHeadById,
      updateAccountHead,
    } = this.props;
    form.validateFields((err, { name, description, startingBalance }) => {
      if (err) return;

      updateAccountHead({
        variables: {
          _id: accountHeadById._id,
          name,
          description,
          startingBalance,
        },
      })
        .then(() => {
          history.push(paths.accountHeadsPath(companyId));
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { accountHeadByIdLoading, accountHeadById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (accountHeadByIdLoading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={accountHeadById.name}
          required
          requiredMessage="Please input a name for the account head."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          disabled
          fieldName="type"
          fieldLabel="Type"
          initialValue={accountHeadById.type}
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={accountHeadById.description}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          disabled={accountHeadById.hasChildren}
          fieldName="startingBalance"
          fieldLabel="Starting Balance"
          initialValue={accountHeadById.startingBalance}
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation updateAccountHead(
    $_id: String!
    $name: String!
    $description: String!
    $startingBalance: Float
  ) {
    updateAccountHead(
      _id: $_id
      name: $name
      description: $description
      startingBalance: $startingBalance
    ) {
      _id
      name
      description
      type
      nature
      number
      parent
      startingBalance
    }
  }
`;

export default compose(
  Form.create(),
  WithCompanyId(),
  WithAccountHeadId(),
  WithAccountHeadById(),
  graphql(formMutation, {
    name: "updateAccountHead",
    options: {
      refetchQueries: ["accountHeadsByCompanyId"],
    },
  }),
  WithBreadcrumbs(["Accounts", "Account Heads", "Edit"])
)(EditForm);
