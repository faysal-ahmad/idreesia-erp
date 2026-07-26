import React from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { message } from 'antd';
import { KarkunsGeneralInfo } from '/imports/ui/modules/common';
import {
  WithAllCities,
  WithAllCityMehfils,
} from 'meteor/idreesia-common/composers/common';

import { HR_KARKUN_BY_ID, UPDATE_HR_KARKUN } from '../gql';

const GeneralInfo = ({
  allCities,
  allCitiesLoading,
  allCityMehfils,
  allCityMehfilsLoading,
  history,
  karkunId,
  match,
}) => {
  const { data, loading: formDataLoading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: match.params.karkunId },
  });
  const [updateHrKarkun] = useMutation(UPDATE_HR_KARKUN, {
    refetchQueries: ['pagedHrKarkuns'],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFinish = ({
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

  if (formDataLoading || allCitiesLoading || allCityMehfilsLoading)
    return null;

  return (
    <KarkunsGeneralInfo
      karkun={data.hrKarkunById}
      handleFinish={handleFinish}
      handleCancel={handleCancel}
      showCityMehfilField
      cities={allCities}
      cityMehfils={allCityMehfils}
    />
  );
};

GeneralInfo.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  karkunId: PropTypes.string,
  allCities: PropTypes.array,
  allCitiesLoading: PropTypes.bool,
  allCityMehfils: PropTypes.array,
  allCityMehfilsLoading: PropTypes.bool,
};

export default flowRight(
  WithAllCities(),
  WithAllCityMehfils()
)(GeneralInfo);
