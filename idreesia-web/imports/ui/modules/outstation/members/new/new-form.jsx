import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { message } from '/imports/ui/controls';
import { VisitorsNewForm } from '/imports/ui/modules/common';

import { CREATE_OUTSTATION_MEMBER } from '../gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createOutstationMember: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = ({
    name,
    parentName,
    cnicNumber,
    ehadDate,
    birthDate,
    referenceName,
    contactNumber1,
    contactNumber2,
    city,
    country,
    currentAddress,
    permanentAddress,
    educationalQualification,
    meansOfEarning,
  }) => {
    const { history, createOutstationMember } = this.props;

    createOutstationMember({
      variables: {
        name,
        parentName,
        cnicNumber,
        ehadDate,
        birthDate,
        referenceName,
        contactNumber1,
        contactNumber2,
        city,
        country,
        currentAddress,
        permanentAddress,
        educationalQualification,
        meansOfEarning,
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
    return (
      <VisitorsNewForm
        handleSubmit={this.handleSubmit}
        handleCancel={this.handleCancel}
      />
    );
  }
}

export default flowRight(
  graphql(CREATE_OUTSTATION_MEMBER, {
    name: 'createOutstationMember',
    options: {
      refetchQueries: ['pagedOutstationMembers'],
    },
  }),
  WithBreadcrumbs(['Outstation', 'Members', 'New'])
)(NewForm);
