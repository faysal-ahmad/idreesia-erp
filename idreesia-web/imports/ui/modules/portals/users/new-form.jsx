import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  KarkunSelectionInputField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import {
  WithPortal,
  WithPortalId,
} from '/imports/ui/modules/portals/common/composers';

import { CREATE_PORTAL_USER, PAGED_PORTAL_USERS } from './gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    portalId: PropTypes.object,
    createPortalUser: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, portalId, createPortalUser, history } = this.props;
    form.validateFields((err, { karkun, userName, password }) => {
      if (err) return;

      createPortalUser({
        variables: {
          portalId,
          karkunId: karkun._id,
          userName,
          password,
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
    const {
      portalId,
      form: { isFieldsTouched },
    } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          required
          requiredMessage="Please input the user name."
        />

        <InputTextField
          fieldName="password"
          fieldLabel="Password"
          type="password"
          required
          requiredMessage="Please specify a password for the user."
        />

        <KarkunSelectionInputField
          fieldName="karkun"
          fieldLabel="Karkun Name"
          portalId={portalId}
          showPortalKarkunsList
          required
          requiredMessage="Please select a karkun."
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
  WithPortalId(),
  WithPortal(),
  graphql(CREATE_PORTAL_USER, {
    name: 'createPortalUser',
    options: ({ portalId }) => ({
      refetchQueries: [
        { query: PAGED_PORTAL_USERS, variables: { portalId, filter: {} } },
      ],
    }),
  }),
  WithDynamicBreadcrumbs(({ portal }) => {
    if (portal) {
      return `Mehfil Portal, ${portal.name}, Users, New`;
    }
    return `Mehfil Portal, Users, New`;
  })
)(NewForm);
