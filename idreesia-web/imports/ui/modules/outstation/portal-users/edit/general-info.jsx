import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, Modal, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithAllPortals } from 'meteor/idreesia-common/composers/admin';
import {
  InputTextField,
  SelectField,
  SwitchField,
  FormButtonsSaveCancelExtra,
} from '/imports/ui/modules/helpers/fields';

import {
  OUTSTATION_PORTAL_USER_BY_ID,
  PAGED_OUTSTATION_PORTAL_USERS,
  UPDATE_OUTSTATION_PORTAL_USER,
  RESET_OUTSTATION_PORTAL_USER_PASSWORD,
} from '../gql';

const { confirm } = Modal;

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
    resetOutstationPortalUserPassword: PropTypes.func,
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

  handlePasswordReset = () => {
    const { userId, resetOutstationPortalUserPassword } = this.props;
    confirm({
      title: 'Do you want to reset the password for this account?',
      onOk() {
        resetOutstationPortalUserPassword({
          variables: {
            userId,
          },
        })
          .then(() => {
            message.success(
              'The password has been reset and a message has been sent to the user.',
              5
            );
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      },
      onCancel() {},
    });
  };

  handleFinish = ({ locked, portalId }) => {
    const { history, userId, updateOutstationPortalUser } = this.props;
    updateOutstationPortalUser({
      variables: {
        userId,
        locked: locked || false,
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

        <SwitchField
          fieldName="locked"
          fieldLabel="Locked"
          initialValue={outstationPortalUserById.locked}
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
          extraText="Reset Password"
          handleCancel={this.handleCancel}
          handleExtra={this.handlePasswordReset}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  WithAllPortals(),
  graphql(RESET_OUTSTATION_PORTAL_USER_PASSWORD, {
    name: 'resetOutstationPortalUserPassword',
  }),
  graphql(UPDATE_OUTSTATION_PORTAL_USER, {
    name: 'updateOutstationPortalUser',
    options: () => ({
      refetchQueries: [
        { query: PAGED_OUTSTATION_PORTAL_USERS, variables: { filter: {} } },
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
