import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
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
    createFinancialAccount: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.financialAccountsPath);
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, importData, connectivitySettings }) => {
    const { createFinancialAccount, history } = this.props;
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
  };

  render() {
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the company."
        />
        <SwitchField
          fieldName="importData"
          fieldLabel="Import Data"
        />
        <InputTextAreaField
          fieldName="connectivitySettings"
          fieldLabel="Connectivity Settings"
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
  graphql(formMutation, {
    name: 'createCompany',
    options: {
      refetchQueries: ['allCompanies'],
    },
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Companies', 'New'])
)(NewForm);
