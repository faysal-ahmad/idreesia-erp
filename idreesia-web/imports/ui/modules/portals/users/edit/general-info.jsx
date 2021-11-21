import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  SwitchField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import {
  PORTAL_USER_BY_ID,
  PAGED_PORTAL_USERS,
  UPDATE_PORTAL_USER,
} from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    portalId: PropTypes.string,
    userId: PropTypes.string,
    loading: PropTypes.bool,
    portalUserById: PropTypes.object,
    updatePortalUser: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, portalId, userId, updatePortalUser } = this.props;
    form.validateFields((err, { password, locked }) => {
      if (err) return;

      updatePortalUser({
        variables: {
          portalId,
          userId,
          password,
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
    const { loading, portalUserById } = this.props;
    const { isFieldsTouched } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          disabled
          initialValue={portalUserById.username}
        />

        <SwitchField
          fieldName="locked"
          fieldLabel="Locked"
          initialValue={portalUserById.locked}
        />

        <InputTextField
          fieldName="password"
          fieldLabel="Password"
          type="password"
        />

        <InputTextField
          fieldName="karkunName"
          fieldLabel="Karkun Name"
          disabled
          initialValue={portalUserById.karkun ? portalUserById.karkun.name : ''}
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
  graphql(UPDATE_PORTAL_USER, {
    name: 'updatePortalUser',
    options: ({ portalId }) => ({
      refetchQueries: [
        { query: PAGED_PORTAL_USERS, variables: { portalId, filter: {} } },
      ],
    }),
  }),
  graphql(PORTAL_USER_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ portalId, userId }) => ({
      variables: { portalId, _id: userId },
    }),
  })
)(GeneralInfo);
