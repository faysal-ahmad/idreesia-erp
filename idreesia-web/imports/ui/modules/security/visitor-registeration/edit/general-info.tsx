import React from 'react';
import { message } from '/imports/ui/antd-feedback';
import { type History } from 'history';
import { useMutation } from '@apollo/client/react';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { PersonGeneralInfo } from '/imports/ui/modules/common';
import type { PersonGeneralInfoFormValues } from '/imports/ui/modules/common/visitors/general-info';
import type { SecurityRegistrationVisitorByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import Picture from './picture';
import {
  UPDATE_SECURITY_VISITOR,
  UPDATE_SECURITY_VISITOR_NOTES,
} from '../gql';

type SecurityVisitor = NonNullable<
  SecurityRegistrationVisitorByIdQuery['securityVisitorById']
>;

interface Props {
  history: History;
  visitorId: string;
  securityVisitorById: SecurityVisitor;
}

const GeneralInfo = ({ history, visitorId, securityVisitorById }: Props) => {
  const refetchQueries = [
    'pagedSecurityVisitors',
    'securityRegistrationVisitorById',
  ];

  const [updateSecurityVisitor] = useMutation(
    UPDATE_SECURITY_VISITOR,
    { refetchQueries }
  );
  const [updateSecurityVisitorNotes] = useMutation(
    UPDATE_SECURITY_VISITOR_NOTES,
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
  }: PersonGeneralInfoFormValues) =>
    Promise.all([
      updateSecurityVisitor({
        variables: {
          _id: securityVisitorById._id ?? '',
          name: name ?? '',
          parentName: parentName ?? '',
          cnicNumber,
          ehadDate: ehadDate as unknown as string,
          birthDate: birthDate as unknown as string | null | undefined,
          referenceName: referenceName ?? '',
          contactNumber1,
          contactNumber2,
          city,
          country,
          currentAddress,
          permanentAddress,
          educationalQualification,
          meansOfEarning,
        },
      }),
      updateSecurityVisitorNotes({
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
