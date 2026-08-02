import React from 'react';
import { type match } from 'react-router';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';

import { message } from 'antd';
import { KarkunsGeneralInfo } from '/imports/ui/modules/common';
import type { KarkunGeneralInfoFormValues } from '/imports/ui/modules/common/karkuns/general-info';
import {
  useAllCities,
  useAllCityMehfils,
} from 'meteor/idreesia-common/hooks/common';

import { HR_KARKUN_BY_ID, UPDATE_HR_KARKUN } from '../gql';

interface Props { history: History; karkunId: string; match: match<{ karkunId: string }>; }

const GeneralInfo = ({
  history,
  karkunId,
  match,
}: Props) => {
  const { allCities, allCitiesLoading } = useAllCities();
  const { allCityMehfils, allCityMehfilsLoading } = useAllCityMehfils();
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
  }: KarkunGeneralInfoFormValues) => {
    updateHrKarkun({
      variables: {
        _id: karkunId,
        name: name ?? '',
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
        ehadDate: ehadDate as unknown as string | null | undefined,
        birthDate: birthDate as unknown as string | null | undefined,
        deathDate: deathDate as unknown as string | null | undefined,
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
    <KarkunsGeneralInfo
      karkun={data?.hrKarkunById ?? {}}
      handleFinish={handleFinish}
      handleCancel={handleCancel}
      showCityMehfilField
      cities={allCities ?? []}
      cityMehfils={allCityMehfils ?? []}
    />
  );
};

export default GeneralInfo;
