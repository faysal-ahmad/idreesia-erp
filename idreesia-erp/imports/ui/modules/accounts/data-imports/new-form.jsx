import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { WithCompanies } from "/imports/ui/modules/accounts/common/composers";
import { AccountsSubModulePaths as paths } from "/imports/ui/modules/accounts";
import {
  MonthField,
  SelectField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    companiesListLoading: PropTypes.bool,
    allCompanies: PropTypes.array,
    createDataImport: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.financialAccountsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createDataImport, history } = this.props;
    form.validateFields((err, { companyId, importType, importForMonth }) => {
      if (err) return;
      createDataImport({
        variables: {
          companyId,
          importType,
          importForMonth,
        },
      })
        .then(() => {
          history.push(paths.dataImportsPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { allCompanies } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <SelectField
          data={allCompanies}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="companyId"
          fieldLabel="Company"
          required
          requiredMessage="Please select a company."
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          data={[
            { value: "account-heads", text: "Account Heads" },
            { value: "vouchers", text: "Vouchers with Details" },
          ]}
          getDataValue={({ value }) => value}
          getDataText={({ text }) => text}
          fieldName="importType"
          fieldLabel="Import Type"
          required
          requiredMessage="Please select an import type."
          getFieldDecorator={getFieldDecorator}
        />
        <MonthField
          fieldName="importForMonth"
          fieldLabel="For Month"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createDataImport(
    $companyId: String!
    $importType: String!
    $importForMonth: String
  ) {
    createDataImport(
      companyId: $companyId
      importType: $importType
      importForMonth: $importForMonth
    ) {
      _id
      companyId
      importType
      importForMonth
      status
      logs
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default compose(
  Form.create(),
  WithCompanies(),
  graphql(formMutation, {
    name: "createDataImport",
    options: {
      refetchQueries: ["pagedDataImports"],
    },
  }),
  WithBreadcrumbs(["Accounts", "Data Imports", "New"])
)(NewForm);
