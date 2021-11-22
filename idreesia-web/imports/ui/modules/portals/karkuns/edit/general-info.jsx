import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { message } from 'antd';
import { KarkunsGeneralInfo } from '/imports/ui/modules/common';
import {
  WithPortalCities,
  WithPortalCityMehfils,
} from '/imports/ui/modules/portals/common/composers';

import {
  PORTAL_KARKUN_BY_ID,
  UPDATE_PORTAL_KARKUN,
  PAGED_PORTAL_KARKUNS,
} from '../gql';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    portalId: PropTypes.string,
    karkunId: PropTypes.string,
    portalCities: PropTypes.array,
    portalCitiesLoading: PropTypes.bool,
    portalCityMehfils: PropTypes.array,
    portalCityMehfilsLoading: PropTypes.bool,
    formDataLoading: PropTypes.bool,
    portalKarkunById: PropTypes.object,
    updatePortalKarkun: PropTypes.func,
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
    referenceName,
  }) => {
    const {
      history,
      portalId,
      portalKarkunById,
      updatePortalKarkun,
    } = this.props;
    updatePortalKarkun({
      variables: {
        portalId,
        _id: portalKarkunById._id,
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
      portalCities,
      portalCitiesLoading,
      portalCityMehfils,
      portalCityMehfilsLoading,
      formDataLoading,
      portalKarkunById,
    } = this.props;
    if (portalCitiesLoading || portalCityMehfilsLoading || formDataLoading)
      return null;

    return (
      <KarkunsGeneralInfo
        karkun={portalKarkunById}
        handleSubmit={this.handleSubmit}
        handleCancel={this.handleCancel}
        showCityMehfilField
        cities={portalCities}
        cityMehfils={portalCityMehfils}
      />
    );
  }
}

export default flowRight(
  WithPortalCities(),
  WithPortalCityMehfils(),
  graphql(UPDATE_PORTAL_KARKUN, {
    name: 'updatePortalKarkun',
    options: ({ portalId }) => ({
      refetchQueries: [
        { query: PAGED_PORTAL_KARKUNS, variables: { portalId, filter: {} } },
      ],
    }),
  }),
  graphql(PORTAL_KARKUN_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ portalId, karkunId }) => ({
      variables: { portalId, _id: karkunId },
    }),
  })
)(GeneralInfo);
