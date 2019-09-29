import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createAccount: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.accountsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createAccount, history } = this.props;
    form.validateFields((err, { karkun, userName, password }) => {
      if (err) return;

      createAccount({
        variables: {
          karkunId: karkun._id,
          userName,
          password,
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

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <KarkunField
          required
          requiredMessage="Please select a karkun for creating the account."
          fieldName="karkun"
          fieldLabel="Karkun Name"
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

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'createAccount',
    options: {
      refetchQueries: ['pagedKarkuns', 'allKarkunsWithAccounts'],
    },
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Account', 'New'])
)(NewForm);
