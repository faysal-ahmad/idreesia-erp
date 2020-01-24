import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  InputTextField,
  SwitchField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    userId: PropTypes.string,
    userById: PropTypes.object,
    updateUser: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.accountsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, userById, updateUser } = this.props;
    form.validateFields((err, { password, email, displayName, locked }) => {
      if (err) return;

      if (email && !email.includes('@gmail.com')) {
        message.error('This is not a valid Google Email.', 5);
        return;
      }

      updateUser({
        variables: {
          userId: userById._id,
          password,
          email,
          displayName,
          locked,
        },
      })
        .then(() => {
          history.goBack();
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { loading, userById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          disabled
          initialValue={userById.username}
          getFieldDecorator={getFieldDecorator}
        />

        <SwitchField
          fieldName="locked"
          fieldLabel="Locked"
          initialValue={userById.locked}
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
          initialValue={userById.email}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="displayName"
          fieldLabel="Display Name"
          initialValue={userById.displayName}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="karkunName"
          fieldLabel="Karkun Name"
          disabled
          initialValue={userById.karkun ? userById.karkun.name : ''}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query userById($_id: String!) {
    userById(_id: $_id) {
      _id
      username
      email
      displayName
      locked
      karkun {
        _id
        name
      }
    }
  }
`;

const formMutation = gql`
  mutation updateUser(
    $userId: String!
    $password: String
    $email: String
    $displayName: String
    $locked: Boolean
  ) {
    updateUser(
      userId: $userId
      password: $password
      email: $email
      displayName: $displayName
      locked: $locked
    ) {
      _id
      username
      email
      displayName
      locked
      karkun {
        _id
        name
      }
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'updateUser',
    options: {
      refetchQueries: ['pagedUsers'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ userId }) => ({ variables: { _id: userId } }),
  })
)(GeneralInfo);
