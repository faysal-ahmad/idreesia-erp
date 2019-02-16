import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  InputTextField,
  InputNumberField,
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
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      createFinancialAccount({
        variables: {
          name: fieldsValue.name,
          startingBalance: fieldsValue.startingBalance,
        },
      })
        .then(() => {
          history.push(paths.financialAccountsPath);
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
          requiredMessage="Please input a name for the financial account."
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="startingBalance"
          fieldLabel="Starting Balance"
          required
          requiredMessage="Please input a value for starting balance."
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createFinancialAccount($name: String!, $startingBalance: Float!) {
    createFinancialAccount(name: $name, startingBalance: $startingBalance) {
      _id
      name
      startingBalance
      currentBalance
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: 'createFinancialAccount',
    options: {
      refetchQueries: ['allFinancialAccounts', 'allAccessibleFinancialAccounts'],
    },
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Financial Accounts', 'New'])
)(NewForm);
