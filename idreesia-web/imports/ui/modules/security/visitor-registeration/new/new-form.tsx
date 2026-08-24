import React from 'react';
import { message } from '/imports/ui/antd-feedback';
import { type RouteComponentProps } from 'react-router';
import { useMutation } from '@apollo/client/react';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { VisitorsNewForm } from '/imports/ui/modules/common';
import type { VisitorNewFormValues } from '/imports/ui/modules/common/visitors/new-form';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { CREATE_SECURITY_VISITOR_PERSON } from '../gql';

type Props = RouteComponentProps;

const NewForm = ({ history }: Props) => {
  useBreadcrumbs(['Security', 'Visitor Registration', 'New']);

  const [createSecurityVisitorPerson] = useMutation(
    CREATE_SECURITY_VISITOR_PERSON,
    { refetchQueries: ['pagedSecurityPeople'] }
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
  }: VisitorNewFormValues) =>
    createSecurityVisitorPerson({
      variables: {
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
        },
        visitorData: {
          city,
          country,
        },
      },
    })
      .then((response) => {
        const newVisitor = response.data?.createSecurityVisitorPerson;
        if (!newVisitor?._id) {
          throw new Error('Visitor was created but no id was returned');
        }
        message.success('Visitor created', 2);
        history.push(paths.visitorRegistrationEditFormPath(newVisitor._id));
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
        throw error;
      });

  return (
    <VisitorsNewForm
      handleFinish={handleFinish}
      handleCancel={handleCancel}
    />
  );
};

export default NewForm;
