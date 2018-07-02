import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import { InputTextField, FormButtonsSaveCancel } from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    financialAccountById: PropTypes.object,
    updateFinancialAccount: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.financialAccountsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, financialAccountById, updateFinancialAccount } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      updateFinancialAccount({
        variables: {
          id: financialAccountById._id,
          name: fieldsValue.name,
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
    const { loading, financialAccountById } = this.props;
    if (loading) return null;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={financialAccountById.name}
          required
          requiredMessage="Please input a name for the financial account."
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query financialAccountById($id: String!) {
    financialAccountById(id: $id) {
      _id
      name
      startingBalance
      currentBalance
    }
  }
`;

const formMutation = gql`
  mutation updateFinancialAccount($id: String!, $name: String!) {
    updateFinancialAccount(id: $id, name: $name) {
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
    name: 'updateFinancialAccount',
    options: {
      refetchQueries: ['allFinancialAccounts', 'allAccessibleFinancialAccounts'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { accountId } = match.params;
      return { variables: { id: accountId } };
    },
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Financial Accounts', 'Edit'])
)(EditForm);
