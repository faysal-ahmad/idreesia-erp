import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  InputTextField,
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

    portalId: PropTypes.string,
    userId: PropTypes.string,
    portalUserById: PropTypes.object,
    updatePortalUser: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ password, locked }) => {
    const { history, portalId, userId, updatePortalUser } = this.props;
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
  };

  render() {
    const { portalUserById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
 
    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          disabled
          initialValue={portalUserById.username}
        />

        <InputTextField
          fieldName="email"
          fieldLabel="Email"
          required
          requiredMessage="Please input the email."
          disabled={!!portalUserById.email && portalUserById.emailVerified}
          initialValue={portalUserById.email}
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
  graphql(UPDATE_PORTAL_USER, {
    name: 'updatePortalUser',
    options: ({ portalId }) => ({
      refetchQueries: [
        { query: PAGED_PORTAL_USERS, variables: { portalId, filter: {} } },
      ],
    }),
  })
)(GeneralInfo);
