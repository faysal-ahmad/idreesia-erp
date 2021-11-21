import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { WithAllPortals } from 'meteor/idreesia-common/composers/admin';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  KarkunSelectionInputField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import {
  CREATE_OUTSTATION_PORTAL_USER,
  PAGED_OUTSTATION_PORTAL_USERS,
} from './gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    allPortals: PropTypes.array,
    allPortalsLoading: PropTypes.bool,
    createOutstationPortalUser: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createOutstationPortalUser, history } = this.props;
    form.validateFields((err, { karkun, userName, portalId }) => {
      if (err) return;

      createOutstationPortalUser({
        variables: {
          portalId,
          karkunId: karkun._id,
          userName,
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
      allPortals,
      allPortalsLoading,
      form: { isFieldsTouched },
    } = this.props;

    const portalsData = allPortalsLoading
      ? []
      : allPortals.map(portal => ({
          value: portal._id,
          text: portal.name,
        }));

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="userName"
          fieldLabel="User name"
          required
          requiredMessage="Please input the user name."
        />

        <KarkunSelectionInputField
          fieldName="karkun"
          fieldLabel="Karkun Name"
          showOutstationKarkunsList
          required
          requiredMessage="Please select a karkun."
        />

        <SelectField
          data={portalsData}
          getDataValue={({ value }) => value}
          getDataText={({ text }) => text}
          fieldName="portalId"
          fieldLabel="Portal"
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
  WithAllPortals(),
  graphql(CREATE_OUTSTATION_PORTAL_USER, {
    name: 'createOutstationPortalUser',
    options: () => ({
      refetchQueries: [
        { query: PAGED_OUTSTATION_PORTAL_USERS, variables: { filter: {} } },
      ],
    }),
  }),
  WithBreadcrumbs(['Outstation', 'Portal User Accounts', 'New'])
)(NewForm);
