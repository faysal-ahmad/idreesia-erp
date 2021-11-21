import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
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
    form.validateFields(
      (err, { karkun, userName, password, email, displayName }) => {
        if (err) return;

        if ((userName && password) || (email && email.includes('@gmail.com'))) {
          createUser({
            variables: {
              karkunId: karkun ? karkun._id : null,
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
          form.setFields({
            userName: {
              errors: [
                new Error(
                  'Either user name and password, or google email is required to create an account.'
                ),
              ],
            },
            password: {
              errors: [
                new Error(
                  'Either user name and password, or google email is required to create an account.'
                ),
              ],
            },
            email: {
              errors: [
                new Error(
                  'Either user name and password, or google email is required to create an account.'
                ),
              ],
            },
          });
        }
      }
    );
  };

  render() {
    const { isFieldsTouched } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
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
  Form.create(),
  graphql(CREATE_USER, {
    name: 'createUser',
    options: {
      refetchQueries: [{ query: PAGED_USERS, variables: { filter: {} } }],
    },
  }),
  WithBreadcrumbs(['Admin', 'Users', 'New'])
)(NewForm);
