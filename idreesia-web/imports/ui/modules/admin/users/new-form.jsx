import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  KarkunSelectionInputField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_USER, PAGED_USERS } from './gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createUser: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  formRef = React.createRef();

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ karkun, userName, password, email, displayName }) => {
    const { createUser, history } = this.props;
      if ((userName && password) || (email && email.includes('@gmail.com'))) {
        createUser({
          variables: {
            personId: karkun ? karkun._id : null,
            userName,
            password,
            email,
            displayName,
          },
        })
          .then(() => {
            history.goBack();
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      } else {
        this.formRef.current.setFields([
          {
            name: 'userName',
            errors: ['Either user name and password, or google email is required to create an account.'],
          },
          {
            name: 'password',
            errors: ['Either user name and password, or google email is required to create an account.'],
          },
          {
            name: 'email',
            errors: ['Either user name and password, or google email is required to create an account.'],
          },
        ]);
      }
  };

  render() {
    const isFieldsTouched = this.state.isFieldsTouched;
    return (
      <Form ref={this.formRef} layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
        />

        <InputTextField
          fieldName="password"
          fieldLabel="Password"
          type="password"
        />

        <InputTextField
          fieldName="email"
          fieldLabel="Google Email"
        />

        <InputTextField
          fieldName="displayName"
          fieldLabel="Display name"
        />

        <KarkunSelectionInputField
          fieldName="karkun"
          fieldLabel="Karkun Name"
          showMsKarkunsList
          showOutstationKarkunsList
        />

        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  graphql(CREATE_USER, {
    name: 'createUser',
    options: {
      refetchQueries: [{ query: PAGED_USERS, variables: { filter: {} } }],
    },
  }),
  WithBreadcrumbs(['Admin', 'Users', 'New'])
)(NewForm);
