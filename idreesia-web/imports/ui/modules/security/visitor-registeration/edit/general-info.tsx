import React from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/client/react';
import { message } from 'antd';
import { VisitorsGeneralInfo } from '/imports/ui/modules/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { UPDATE_SECURITY_VISITOR, SECURITY_VISITOR_BY_ID } from '../gql';

const VisitorsGeneralInfoComponent = VisitorsGeneralInfo as any;
interface HistoryLike { push(path: string): void; }
interface VisitorRecord { _id: string; [key: string]: unknown; }
interface VisitorValues { [key: string]: unknown; }
interface GeneralInfoProps { history: HistoryLike; formDataLoading?: boolean; securityVisitorById?: VisitorRecord | null; }
interface GeneralInfoWithDataProps { match: { params: { visitorId: string } }; history: HistoryLike; [key: string]: any; }
interface VisitorData { securityVisitorById?: VisitorRecord | null; }

const GeneralInfo = ({ history, formDataLoading, securityVisitorById }: GeneralInfoProps) => {
  const [updateSecurityVisitor] = useMutation(UPDATE_SECURITY_VISITOR as any, {
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
  }: VisitorValues) => {
    updateSecurityVisitor({
      variables: {
        _id: securityVisitorById?._id,
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (formDataLoading || !securityVisitorById) return null;

  return (
    <VisitorsGeneralInfoComponent
      visitor={securityVisitorById}
      handleFinish={handleFinish}
      handleCancel={handleCancel}
    />
  );
};

const GeneralInfoWithData = (props: GeneralInfoWithDataProps) => {
  const { match } = props;
  const { visitorId } = match.params;
  const { data = {}, loading, ...queryResult } = useQuery(SECURITY_VISITOR_BY_ID as any, {
    variables: { _id: visitorId },
  });

  return (
    <GeneralInfo
      {...props}
      {...queryResult}
      {...(data as VisitorData)}
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
