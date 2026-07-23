import React from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/client/react';
import { message } from 'antd';
import { VisitorsGeneralInfo } from '/imports/ui/modules/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { UPDATE_SECURITY_VISITOR, SECURITY_VISITOR_BY_ID } from '../gql';

const GeneralInfo = ({ history, formDataLoading, securityVisitorById }) => {
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
  }) => {
    updateSecurityVisitor({
      variables: {
        _id: securityVisitorById._id,
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
      .then(() => {
        history.push(`${paths.visitorRegistrationListPath}`);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  if (formDataLoading) return null;

  return (
    <VisitorsGeneralInfo
      visitor={securityVisitorById}
      handleFinish={handleFinish}
      handleCancel={handleCancel}
    />
  );
};

const GeneralInfoWithData = props => {
  const { match } = props;
  const { visitorId } = match.params;
  const { data = {}, loading, ...queryResult } = useQuery(SECURITY_VISITOR_BY_ID, {
    variables: { _id: visitorId },
  });

  return (
    <GeneralInfo
      {...props}
      {...queryResult}
      {...data}
      formDataLoading={loading}
    />
  );
};

GeneralInfo.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  formDataLoading: PropTypes.bool,
  visitorId: PropTypes.string,
  securityVisitorById: PropTypes.object,
};

export default GeneralInfoWithData;
