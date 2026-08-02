import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation } from '@apollo/client/react';
import { message } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { VisitorsNewForm } from '/imports/ui/modules/common';
import type { VisitorNewFormValues } from '/imports/ui/modules/common/visitors/new-form';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { CREATE_SECURITY_VISITOR } from '../gql';

type Props = RouteComponentProps;

const NewForm = ({ history }: Props) => {
  useBreadcrumbs(['Security', 'Visitor Registration', 'New']);

  const [createSecurityVisitor] = useMutation(CREATE_SECURITY_VISITOR, {
    refetchQueries: ['pagedSecurityVisitors'],
  });

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
    createSecurityVisitor({
      variables: {
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
      .then((response) => {
        const newVisitor = response.data?.createSecurityVisitor;
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
