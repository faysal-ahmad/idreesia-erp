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
    form.validateFields((err, { karkun, userName, password, email }) => {
      if (err) return;

      if ((userName && password) || (email && email.includes('@gmail.com'))) {
        createAccount({
          variables: {
            karkunId: karkun._id,
            userName,
            password,
            email,
          },
        })
          .then(() => {
            history.push(paths.accountsPath);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      } else {
        message.error(
          'Either User name and password, or Google Email is required to create an account.',
          5
        );
      }
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
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="password"
          fieldLabel="Password"
          type="password"
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="email"
          fieldLabel="Google Email"
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
    $userName: String
    $password: String
    $email: String
  ) {
    createAccount(
      karkunId: $karkunId
      userName: $userName
      password: $password
      email: $email
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
