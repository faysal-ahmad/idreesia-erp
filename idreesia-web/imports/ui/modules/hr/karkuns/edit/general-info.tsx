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

const KarkunsGeneralInfoForm = KarkunsGeneralInfo as any;
type AnyRecord = Record<string, any>;
interface HistoryLike { goBack(): void; }
interface MatchLike { params: { karkunId: string; }; }
interface QueryData { hrKarkunById?: AnyRecord | null; }
interface Props { allCities?: AnyRecord[]; allCitiesLoading?: boolean; allCityMehfils?: AnyRecord[]; allCityMehfilsLoading?: boolean; history: HistoryLike; karkunId?: string | null; match: MatchLike; }

const GeneralInfo = ({
  allCities,
  allCitiesLoading,
  allCityMehfils,
  allCityMehfilsLoading,
  history,
  karkunId,
  match,
}: Props) => {
  const { data, loading: formDataLoading } = useQuery(HR_KARKUN_BY_ID as any, {
    variables: { _id: match.params.karkunId },
  });
  const [updateHrKarkun] = useMutation(UPDATE_HR_KARKUN as any, {
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
  }: AnyRecord) => {
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
        cityId: cityIdMehfilId?.[0],
        cityMehfilId: cityIdMehfilId?.[1],
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (formDataLoading || allCitiesLoading || allCityMehfilsLoading)
    return null;

  return (
    <KarkunsGeneralInfoForm
      karkun={(data as QueryData)?.hrKarkunById}
      handleFinish={handleFinish}
      handleCancel={handleCancel}
      showCityMehfilField
      cities={allCities ?? []}
      cityMehfils={allCityMehfils ?? []}
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
)(GeneralInfo as any);
