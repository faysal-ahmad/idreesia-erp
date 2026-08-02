import React from 'react';
import { type History } from 'history';
import { useMutation } from '@apollo/client/react';
import { message } from 'antd';

import { VisitorsGeneralInfo } from '/imports/ui/modules/common';
import type { VisitorGeneralInfoFormValues } from '/imports/ui/modules/common/visitors/general-info';
import type { SecurityRegistrationVisitorByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { UPDATE_SECURITY_VISITOR } from '../gql';

type SecurityVisitor = NonNullable<
  SecurityRegistrationVisitorByIdQuery['securityVisitorById']
>;

interface Props {
  history: History;
  visitorId: string;
  securityVisitorById: SecurityVisitor;
}

const GeneralInfo = ({ history, securityVisitorById }: Props) => {
  const [updateSecurityVisitor] = useMutation(UPDATE_SECURITY_VISITOR, {
    refetchQueries: ['pagedSecurityVisitors'],
  });

  const handleCancel = () => {
    history.push(`${paths.visitorRegistrationListPath}`);
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
  }: VisitorGeneralInfoFormValues) => {
    updateSecurityVisitor({
      variables: {
        _id: securityVisitorById._id ?? '',
        name: name ?? '',
        parentName: parentName ?? '',
        cnicNumber: cnicNumber ?? '',
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
    })
      .then(() => {
        history.push(`${paths.visitorRegistrationListPath}`);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <VisitorsGeneralInfo
      visitor={securityVisitorById}
      handleFinish={handleFinish}
      handleCancel={handleCancel}
    />
  );
};

export default GeneralInfo;
