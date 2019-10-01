import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  InputTextField,
  SwitchField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createFinancialAccount: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.financialAccountsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createFinancialAccount, history } = this.props;
    form.validateFields((err, { name, importData, connectivitySettings }) => {
      if (err) return;
      createFinancialAccount({
        variables: {
          name,
          importData,
          connectivitySettings,
        },
      })
        .then(() => {
          history.push(paths.companiesPath);
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
          requiredMessage="Please input a name for the company."
          getFieldDecorator={getFieldDecorator}
        />
        <SwitchField
          fieldName="importData"
          fieldLabel="Import Data"
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="connectivitySettings"
          fieldLabel="Connectivity Settings"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createCompany(
    $name: String!
    $importData: String!
    $connectivitySettings: String
  ) {
    createCompany(
      name: $name
      importData: $importData
      connectivitySettings: $connectivitySettings
    ) {
      _id
      name
      importData
      connectivitySettings
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'createCompany',
    options: {
      refetchQueries: ['allCompanies'],
    },
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Companies', 'New'])
)(NewForm);
