import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
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
    createUser: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createUser, history } = this.props;
    form.validateFields((err, { karkun, userName, password, email }) => {
      if (err) return;

      if ((userName && password) || (email && email.includes('@gmail.com'))) {
        createUser({
          variables: {
            karkunId: karkun ? karkun._id : null,
            userName,
            password,
            email,
          },
        })
          .then(() => {
            history.goBack();
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

        <InputTextField
          fieldName="displayName"
          fieldLabel="Display name"
          getFieldDecorator={getFieldDecorator}
        />

        <KarkunField
          fieldName="karkun"
          fieldLabel="Karkun Name"
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createUser(
    $karkunId: String!
    $userName: String
    $password: String
    $email: String
  ) {
    createUser(
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
    name: 'createUser',
    options: {
      refetchQueries: ['pagedUsers'],
    },
  }),
  WithBreadcrumbs(['Admin', 'Users', 'New'])
)(NewForm);
