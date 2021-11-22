import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { message } from 'antd';
import { KarkunsGeneralInfo } from '/imports/ui/modules/common';
import {
  WithAllCities,
  WithAllCityMehfils,
} from '/imports/ui/modules/outstation/common/composers';

import { HR_KARKUN_BY_ID, UPDATE_HR_KARKUN } from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    karkunId: PropTypes.string,
    allCities: PropTypes.array,
    allCitiesLoading: PropTypes.bool,
    allCityMehfils: PropTypes.array,
    allCityMehfilsLoading: PropTypes.bool,
    hrKarkunById: PropTypes.object,
    formDataLoading: PropTypes.bool,
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
    cityIdMehfilId,
    bloodGroup,
    educationalQualification,
    meansOfEarning,
    ehadDate,
    birthDate,
    deathDate,
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
        cityId: cityIdMehfilId[0],
        cityMehfilId: cityIdMehfilId[1],
        bloodGroup: bloodGroup || null,
        educationalQualification,
        meansOfEarning,
        ehadDate,
        birthDate,
        deathDate,
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
    const {
      allCities,
      allCitiesLoading,
      allCityMehfils,
      allCityMehfilsLoading,
      formDataLoading,
      hrKarkunById,
    } = this.props;
    if (formDataLoading || allCitiesLoading || allCityMehfilsLoading)
      return null;

    return (
      <KarkunsGeneralInfo
        karkun={hrKarkunById}
        handleSubmit={this.handleSubmit}
        handleCancel={this.handleCancel}
        showCityMehfilField
        cities={allCities}
        cityMehfils={allCityMehfils}
      />
    );
  }
}

export default flowRight(
  WithAllCities(),
  WithAllCityMehfils(),
  graphql(UPDATE_HR_KARKUN, {
    name: 'updateHrKarkun',
    options: {
      refetchQueries: ['pagedHrKarkuns'],
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
