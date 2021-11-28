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

import {
  OUTSTATION_KARKUN_BY_ID,
  PAGED_OUTSTATION_KARKUNS,
  UPDATE_OUTSTATION_KARKUN,
} from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    karkunId: PropTypes.string,
    allCities: PropTypes.array,
    allCitiesLoading: PropTypes.bool,
    allCityMehfils: PropTypes.array,
    allCityMehfilsLoading: PropTypes.bool,
    formDataLoading: PropTypes.bool,
    outstationKarkunById: PropTypes.object,
    updateOutstationKarkun: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFinish = ({
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
    referenceName,
    ehadKarkun,
    ehadPermissionDate,
  }) => {
    const {
      history,
      outstationKarkunById,
      updateOutstationKarkun,
    } = this.props;
    updateOutstationKarkun({
      variables: {
        _id: outstationKarkunById._id,
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
        referenceName,
        ehadKarkun,
        ehadPermissionDate,
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
      outstationKarkunById,
    } = this.props;
    if (allCitiesLoading || allCityMehfilsLoading || formDataLoading)
      return null;

    return (
      <KarkunsGeneralInfo
        karkun={outstationKarkunById}
        handleFinish={this.handleFinish}
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
  graphql(UPDATE_OUTSTATION_KARKUN, {
    name: 'updateOutstationKarkun',
    options: {
      refetchQueries: [{ query: PAGED_OUTSTATION_KARKUNS }],
    },
  }),
  graphql(OUTSTATION_KARKUN_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  })
)(GeneralInfo);
