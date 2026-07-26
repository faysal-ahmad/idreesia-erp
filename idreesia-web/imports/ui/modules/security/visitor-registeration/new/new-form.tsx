// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client/react';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { message } from 'antd';
import { VisitorsNewForm } from '/imports/ui/modules/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { CREATE_SECURITY_VISITOR } from '../gql';

const NewForm = ({ history }) => {
  const [createSecurityVisitor] = useMutation(CREATE_SECURITY_VISITOR, {
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
  }) => {
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
      .then(({ data: { createSecurityVisitor: newVisitor } }) => {
        history.push(
          `${paths.visitorRegistrationEditFormPath(newVisitor._id)}`
        );
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  return (
    <VisitorsNewForm
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
)(NewForm);
