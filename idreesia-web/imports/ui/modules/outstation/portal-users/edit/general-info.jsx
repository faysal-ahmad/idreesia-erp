import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithAllPortals } from 'meteor/idreesia-common/composers/admin';
import {
  InputTextField,
  SelectField,
  FormButtonsSaveCancelExtra,
} from '/imports/ui/modules/helpers/fields';

import {
  OUTSTATION_PORTAL_USER_BY_ID,
  PAGED_OUTSTATION_PORTAL_USERS,
  UPDATE_OUTSTATION_PORTAL_USER,
  LOCK_OUTSTATION_PORTAL_USER,
  UNLOCK_OUTSTATION_PORTAL_USER,
} from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    allPortals: PropTypes.array,
    allPortalsLoading: PropTypes.bool,
    userId: PropTypes.string,
    loading: PropTypes.bool,
    outstationPortalUserById: PropTypes.object,
    updateOutstationPortalUser: PropTypes.func,
    lockOutstationPortalUser: PropTypes.func,
    unlockOutstationPortalUser: PropTypes.func,
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

  handleLockUnlock = () => {
    const {
      userId,
      outstationPortalUserById,
      lockOutstationPortalUser,
      unlockOutstationPortalUser,
    } = this.props;

    if (outstationPortalUserById.locked) {
      unlockOutstationPortalUser({
        variables: { userId },
      })
      .catch(error => {
        message.error(error.message, 5);
      });
    } else {
      lockOutstationPortalUser({
        variables: { userId },
      })
      .catch(error => {
        message.error(error.message, 5);
      });
    }
  };

  handleFinish = ({ email, portalId }) => {
    const { history, userId, updateOutstationPortalUser } = this.props;
    updateOutstationPortalUser({
      variables: {
        userId,
        email,
        portalId,
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
    const {
      loading,
      outstationPortalUserById,
      allPortals,
      allPortalsLoading,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading || allPortalsLoading) return null;

    const portalId = outstationPortalUserById.instances[0];
    const portalsData = allPortals.map(portal => ({
      value: portal._id,
      text: portal.name,
    }));

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          disabled
          initialValue={outstationPortalUserById.username}
        />

        <InputTextField
          fieldName="email"
          fieldLabel="Email"
          disabled={!!outstationPortalUserById.email && outstationPortalUserById.emailVerified}
          initialValue={outstationPortalUserById.email}
        />

        <InputTextField
          fieldName="karkunName"
          fieldLabel="Karkun Name"
          disabled
          initialValue={outstationPortalUserById.karkun.name}
        />

        <SelectField
          data={portalsData}
          getDataValue={({ value }) => value}
          getDataText={({ text }) => text}
          fieldName="portalId"
          fieldLabel="Portal"
          initialValue={portalId}
        />

        <FormButtonsSaveCancelExtra
          extraText={outstationPortalUserById.locked ? "Unlock Account" : "Lock Account"}
          handleCancel={this.handleCancel}
          handleExtra={this.handleLockUnlock}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  WithAllPortals(),
  graphql(UPDATE_OUTSTATION_PORTAL_USER, {
    name: 'updateOutstationPortalUser',
    options: () => ({
      refetchQueries: [
        { query: PAGED_OUTSTATION_PORTAL_USERS, variables: { filter: {} } },
      ],
    }),
  }),
  graphql(LOCK_OUTSTATION_PORTAL_USER, {
    name: 'lockOutstationPortalUser',
    options: ({ userId }) => ({
      refetchQueries: [
        { query: OUTSTATION_PORTAL_USER_BY_ID, variables: { _id: userId } },
      ],
    }),
  }),
  graphql(UNLOCK_OUTSTATION_PORTAL_USER, {
    name: 'unlockOutstationPortalUser',
    options: ({ userId }) => ({
      refetchQueries: [
        { query: OUTSTATION_PORTAL_USER_BY_ID, variables: { _id: userId } },
      ],
    }),
  }),
  graphql(OUTSTATION_PORTAL_USER_BY_ID, {
    props: ({ data }) => ({ ...data }),
    options: ({ userId }) => ({
      variables: { _id: userId },
    }),
  })
)(GeneralInfo);
