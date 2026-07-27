import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client/react';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { message } from 'antd';
import { VisitorsNewForm } from '/imports/ui/modules/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { CREATE_SECURITY_VISITOR } from '../gql';

const VisitorsNewFormComponent = VisitorsNewForm as any;
interface HistoryLike { goBack(): void; push(path: string): void; }
interface NewFormProps { history: HistoryLike; }
interface VisitorValues { [key: string]: unknown; name?: string; parentName?: string; cnicNumber?: string; ehadDate?: string; birthDate?: string; referenceName?: string; contactNumber1?: string; contactNumber2?: string; city?: string; country?: string; currentAddress?: string; permanentAddress?: string; educationalQualification?: string; meansOfEarning?: string; }
interface VisitorMutationResult { createSecurityVisitor?: { _id: string }; }

const NewForm = ({ history }: NewFormProps) => {
  const [createSecurityVisitor] = useMutation(CREATE_SECURITY_VISITOR as any, {
    refetchQueries: ['pagedSecurityVisitors'],
  });

  const handleCancel = () => {
    history.goBack();
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
  }: VisitorValues) => {
    createSecurityVisitor({
      variables: {
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
      },
    })
      .then((response: any) => {
        const newVisitor = (response.data as VisitorMutationResult | undefined)?.createSecurityVisitor;
        if (!newVisitor) return;
        history.push(
          `${paths.visitorRegistrationEditFormPath(newVisitor._id)}`
        );
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <VisitorsNewFormComponent
      handleFinish={handleFinish}
      handleCancel={handleCancel}
    />
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default flowRight(
  WithBreadcrumbs(['Security', 'Visitor Registration', 'New'])
)(NewForm as any);
