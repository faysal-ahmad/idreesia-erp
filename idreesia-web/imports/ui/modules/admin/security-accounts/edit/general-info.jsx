import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    karkunId: PropTypes.string,
    karkunById: PropTypes.object,
    updateAccount: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.accountsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, karkunById, updateAccount } = this.props;
    form.validateFields((err, { password, email }) => {
      if (err) return;

      if (email && !email.includes('@gmail.com')) {
        message.error('This is not a valid Google Email.', 5);
        return;
      }

      updateAccount({
        variables: {
          userId: karkunById.user._id,
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
    });
  };

  render() {
    const { loading, karkunById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          disabled
          initialValue={karkunById.name}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          disabled
          initialValue={karkunById.user.username}
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
          initialValue={karkunById.user.email}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query karkunById($_id: String!) {
    karkunById(_id: $_id) {
      _id
      name
      user {
        _id
        username
        email
      }
    }
  }
`;

const formMutation = gql`
  mutation updateAccount($userId: String!, $password: String, $email: String) {
    updateAccount(userId: $userId, password: $password, email: $email) {
      _id
      name
      user {
        _id
        username
        email
      }
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'updateAccount',
    options: {
      refetchQueries: ['allKarkunsWithAccounts'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  })
)(GeneralInfo);
