import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  InputTextField,
  SwitchField,
  KarkunSelectionInputField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { USER_BY_ID, PAGED_USERS, UPDATE_USER } from '../gql';

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
    history.goBack();
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
    const { isFieldsTouched } = this.props.form;
    if (loading) return null;

    const karkunField = userById.karkunId ? (
      <InputTextField
        fieldName="karkunName"
        fieldLabel="Karkun Name"
        disabled
        initialValue={userById.karkun ? userById.karkun.name : ''}
      />
    ) : (
      <KarkunSelectionInputField
        fieldName="karkun"
        fieldLabel="Karkun Name"
        showMsKarkunsList
        showOutstationKarkunsList
      />
    );

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          disabled
          initialValue={userById.username}
        />

        <SwitchField
          fieldName="locked"
          fieldLabel="Locked"
          initialValue={userById.locked}
        />

        <InputTextField
          fieldName="password"
          fieldLabel="Password"
          type="password"
        />

        <InputTextField
          fieldName="email"
          fieldLabel="Google Email"
          initialValue={userById.email}
        />

        <InputTextField
          fieldName="displayName"
          fieldLabel="Display Name"
          initialValue={userById.displayName}
        />

        {karkunField}

        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  graphql(UPDATE_USER, {
    name: 'updateUser',
    options: {
      refetchQueries: [{ query: PAGED_USERS, variables: { filter: {} } }],
    },
  }),
  graphql(USER_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ userId }) => ({ variables: { _id: userId } }),
  })
)(GeneralInfo);
