import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { Form, message } from 'antd';

import {
  DateField,
  InputTextAreaField,
  SelectField,
  SwitchField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { useAllJobs } from '/imports/ui/modules/hr/common/composers';

import { HR_KARKUN_BY_ID, SET_HR_KARKUN_EMPLOYMENT_INFO } from '../gql';

const EmploymentInfo = ({ history, karkunId, match }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { allJobs, allJobsLoading } = useAllJobs();
  const { data, loading: formDataLoading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: match.params.karkunId },
  });
  const [setHrKarkunEmploymentInfo] = useMutation(
    SET_HR_KARKUN_EMPLOYMENT_INFO,
    {
      refetchQueries: ['pagedHrKarkuns', 'allJobs'],
    }
  );

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({
    isEmployee,
    jobId,
    employmentStartDate,
    employmentEndDate,
    bankAccountDetails,
  }) => {
    setHrKarkunEmploymentInfo({
      variables: {
        _id: karkunId,
        isEmployee,
        jobId: jobId || null,
        employmentStartDate,
        employmentEndDate,
        bankAccountDetails,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  if (formDataLoading || allJobsLoading) return null;

  const { hrKarkunById } = data;

  return (
    <Form
      layout="horizontal"
      onFinish={handleFinish}
      onFieldsChange={handleFieldsChange}
    >
      <SwitchField
        fieldName="isEmployee"
        fieldLabel="Is Employee"
        initialValue={hrKarkunById.isEmployee || false}
      />

      <SelectField
        fieldName="jobId"
        fieldLabel="Current Job"
        required={false}
        data={allJobs}
        getDataValue={({ _id }) => _id}
        getDataText={({ name }) => name}
        initialValue={hrKarkunById.jobId}
      />

      <DateField
        fieldName="employmentStartDate"
        fieldLabel="Start Date"
        initialValue={
          hrKarkunById.employmentStartDate
            ? dayjs(Number(hrKarkunById.employmentStartDate))
            : null
        }
      />

      <DateField
        fieldName="employmentEndDate"
        fieldLabel="End Date"
        initialValue={
          hrKarkunById.employmentEndDate
            ? dayjs(Number(hrKarkunById.employmentEndDate))
            : null
        }
      />

      <InputTextAreaField
        fieldName="bankAccountDetails"
        fieldLabel="Bank Account Details"
        initialValue={hrKarkunById.bankAccountDetails}
        required={false}
      />

      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

EmploymentInfo.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  karkunId: PropTypes.string,
};

export default EmploymentInfo;
