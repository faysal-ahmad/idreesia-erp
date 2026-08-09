import React, { useState } from 'react';
import { type match } from 'react-router';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs, { type Dayjs } from 'dayjs';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  DateField,
  SelectField,
  SwitchField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { useAllJobs } from '/imports/ui/modules/hr/common/hooks';
import type { AllJobsQuery } from 'meteor/idreesia-common/types/client-operations';

import { HR_KARKUN_BY_ID, SET_HR_KARKUN_EMPLOYMENT_INFO } from '../gql';

type Job = NonNullable<NonNullable<AllJobsQuery['allJobs']>[number]>;
interface Props { match: match<{ karkunId: string }>; history: History; karkunId: string; }
interface FormValues {
  isEmployee?: boolean;
  jobId?: string | null;
  employmentStartDate?: Dayjs | null;
  employmentEndDate?: Dayjs | null;
}

const EmploymentInfo = ({ history, karkunId, match }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { allJobs: rawAllJobs, allJobsLoading } = useAllJobs();
  const allJobs = (rawAllJobs ?? []).filter((job): job is Job => job != null);
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
  }: FormValues) => {
    setHrKarkunEmploymentInfo({
      variables: {
        _id: karkunId,
        isEmployee: isEmployee ?? false,
        jobId: jobId || null,
        employmentStartDate: employmentStartDate as unknown as string | null | undefined,
        employmentEndDate: employmentEndDate as unknown as string | null | undefined,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const hrKarkunById = data?.hrKarkunById;

  if (formDataLoading || allJobsLoading || !hrKarkunById) return null;

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

      <SelectField<Job>
        fieldName="jobId"
        fieldLabel="Current Job"
        required={false}
        data={allJobs}
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

      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default EmploymentInfo;
