import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { message } from '/imports/ui/controls';
import { KarkunsGeneralInfo } from '/imports/ui/modules/common';

import { HR_KARKUN_BY_ID, UPDATE_HR_KARKUN } from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    karkunId: PropTypes.string,
    hrKarkunById: PropTypes.object,
    updateHrKarkun: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = ({
    name,
    parentName,
    cnicNumber,
    contactNumber1,
    contactNumber2,
    emailAddress,
    currentAddress,
    permanentAddress,
    bloodGroup,
    sharedResidenceId,
    educationalQualification,
    meansOfEarning,
    ehadDate,
    birthDate,
    lastTarteebDate,
    referenceName,
  }) => {
    const { history, karkunId, updateHrKarkun } = this.props;
    updateHrKarkun({
      variables: {
        _id: karkunId,
        name,
        parentName,
        cnicNumber,
        contactNumber1,
        contactNumber2,
        emailAddress,
        currentAddress,
        permanentAddress,
        bloodGroup: bloodGroup || null,
        sharedResidenceId: sharedResidenceId || null,
        educationalQualification,
        meansOfEarning,
        ehadDate,
        birthDate,
        lastTarteebDate: lastTarteebDate
          ? lastTarteebDate.startOf('day')
          : null,
        referenceName,
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
    const { formDataLoading, hrKarkunById } = this.props;
    if (formDataLoading) return null;

    return (
      <KarkunsGeneralInfo
        karkun={hrKarkunById}
        handleSubmit={this.handleSubmit}
        handleCancel={this.handleCancel}
        showSharedResidencesField
      />
    );
  }
}

export default flowRight(
  graphql(UPDATE_HR_KARKUN, {
    name: 'updateHrKarkun',
    options: {
      refetchQueries: ['pagedHrKarkuns', 'pagedSharedResidences'],
    },
  }),
  graphql(HR_KARKUN_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  })
)(GeneralInfo);
