import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from 'antd';
import {
  WithCompanyId,
  WithCompany,
  WithAccountHeadId,
  WithAccountHeadById,
} from '/imports/ui/modules/accounts/common/composers';
import { AccountsSubModulePaths as paths } from '/imports/ui/modules/accounts';
import {
  InputTextField,
  InputTextAreaField,
  InputNumberField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    setBreadcrumbs: PropTypes.func,

    companyId: PropTypes.string,
    company: PropTypes.object,
    accountHeadByIdLoading: PropTypes.bool,
    accountHeadById: PropTypes.object,
    updateAccountHead: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  formRef = React.createRef();

  componentDidMount() {
    const { company, setBreadcrumbs } = this.props;
    if (company) {
      setBreadcrumbs([company.name, 'Account Heads', 'Edit']);
    }
  }

  componentDidUpdate(prevProps) {
    const { company, setBreadcrumbs } = this.props;
    if (prevProps.company !== company) {
      setBreadcrumbs([company.name, 'Account Heads', 'Edit']);
    }
  }

  handleCancel = () => {
    const { history, companyId } = this.props;
    history.push(paths.accountHeadsPath(companyId));
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, description, startingBalance }) => {
    const {
      history,
      companyId,
      accountHeadById,
      updateAccountHead,
    } = this.props;

    updateAccountHead({
      variables: {
        _id: accountHeadById._id,
        companyId,
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
  };

  render() {
    const { accountHeadByIdLoading, accountHeadById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (accountHeadByIdLoading) return null;

    return (
      <Form ref={this.formRef} layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={accountHeadById.name}
          required
          requiredMessage="Please input a name for the account head."
        />
        <InputTextField
          disabled
          fieldName="type"
          fieldLabel="Type"
          initialValue={accountHeadById.type}
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={accountHeadById.description}
        />
        <InputNumberField
          disabled={accountHeadById.hasChildren}
          fieldName="startingBalance"
          fieldLabel="Starting Balance"
          initialValue={accountHeadById.startingBalance}
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
  mutation updateAccountHead(
    $_id: String!
    $companyId: String!
    $name: String!
    $description: String!
    $startingBalance: Float
  ) {
    updateAccountHead(
      _id: $_id
      companyId: $companyId
      name: $name
      description: $description
      startingBalance: $startingBalance
    ) {
      _id
      companyId
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

export default flowRight(
  WithCompanyId(),
  WithCompany(),
  WithAccountHeadId(),
  WithAccountHeadById(),
  graphql(formMutation, {
    name: 'updateAccountHead',
    options: {
      refetchQueries: ['accountHeadsByCompanyId'],
    },
  }),
  WithBreadcrumbs(['Accounts', 'Account Heads', 'Edit'])
)(EditForm);
