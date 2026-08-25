import React from 'react';
import { message } from '/imports/ui/antd-feedback';
import { type History } from 'history';
import { useMutation } from '@apollo/client/react';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { PersonGeneralInfo } from '/imports/ui/modules/common';
import type { PersonGeneralInfoFormValues } from '/imports/ui/modules/common/visitors/general-info';
import type { SecurityRegistrationPersonByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import Picture from './picture';
import {
  UPDATE_SECURITY_VISITOR_PERSON,
  UPDATE_SECURITY_PERSON_VISITOR_DATA,
} from '../gql';

type SecurityVisitor = NonNullable<
  SecurityRegistrationPersonByIdQuery['securityPersonById']
>;

interface Props {
  history: History;
  visitorId: string;
  securityVisitorById: SecurityVisitor;
}

const GeneralInfo = ({ history, visitorId, securityVisitorById }: Props) => {
  const refetchQueries = [
    'pagedSecurityPeople',
    'securityRegistrationPersonById',
  ];

  const [updateSecurityVisitorPerson] = useMutation(
    UPDATE_SECURITY_VISITOR_PERSON,
    { refetchQueries }
  );
  const [updateSecurityPersonVisitorData] = useMutation(
    UPDATE_SECURITY_PERSON_VISITOR_DATA,
    { refetchQueries }
  );

  const handleCancel = () => {
    history.push(paths.visitorRegistrationListPath);
  };

  const handleFinish = ({
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
    criminalRecord,
    otherNotes,
    tagIds,
  }: PersonGeneralInfoFormValues) =>
    Promise.all([
      updateSecurityVisitorPerson({
        variables: {
          _id: securityVisitorById._id ?? '',
          sharedData: {
            name: name ?? '',
            parentName: parentName ?? '',
            cnicNumber,
            ehadDate: ehadDate as unknown as string,
            birthDate: birthDate as unknown as string | null | undefined,
            referenceName: referenceName ?? '',
            contactNumber1,
            contactNumber2,
            currentAddress,
            permanentAddress,
            educationalQualification,
            meansOfEarning,
            tagIds,
          },
          visitorData: {
            city,
            country,
          },
        },
      }),
      updateSecurityPersonVisitorData({
        variables: {
          _id: securityVisitorById._id ?? '',
          criminalRecord,
          otherNotes,
        },
      }),
    ])
      .then(() => {
        message.success('Visitor updated', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
        throw error;
      });

  return (
    <PersonGeneralInfo
      person={securityVisitorById}
      handleFinish={handleFinish}
      handleCancel={handleCancel}
      showAdditionalInfoSection
      tagsModuleFilter={ModuleNames.security}
      sideContent={
        <Picture
          visitorId={visitorId}
          securityVisitorById={securityVisitorById}
        />
      }
    />
  );
};

export default GeneralInfo;
