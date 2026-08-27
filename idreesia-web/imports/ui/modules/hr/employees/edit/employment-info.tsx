import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs, { type Dayjs } from 'dayjs';
import { Form, Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import {
  DateField,
  SelectField,
  SwitchField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { useAllJobs } from '/imports/ui/modules/hr/common/hooks';
import type { AllJobsQuery } from 'meteor/idreesia-common/types/client-operations';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import { HR_KARKUN_BY_ID, SET_HR_KARKUN_EMPLOYMENT_INFO } from '../gql';

type Job = NonNullable<NonNullable<AllJobsQuery['allJobs']>[number]>;

interface Props {
  history: History;
  employeeId: string;
}

interface FormValues {
  isEmployee?: boolean;
  jobId?: string | null;
  employmentStartDate?: Dayjs | null;
  employmentEndDate?: Dayjs | null;
}

const EmploymentInfo = ({ history, employeeId }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { allJobs: rawAllJobs, allJobsLoading } = useAllJobs();
  const allJobs = (rawAllJobs ?? []).filter((job): job is Job => job != null);
  const { data, loading: formDataLoading } = useQuery(HR_KARKUN_BY_ID, {
    variables: { _id: employeeId },
  });
  const [setHrKarkunEmploymentInfo] = useMutation(
    SET_HR_KARKUN_EMPLOYMENT_INFO,
    {
      refetchQueries: ['pagedHrKarkuns', 'allJobs', 'hrKarkunByIdForPeople'],
    }
  );

  const handleCancel = () => {
    history.push(paths.employeesPath);
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
        _id: employeeId,
        isEmployee: isEmployee ?? false,
        jobId: jobId || null,
        employmentStartDate:
          employmentStartDate as unknown as string | null | undefined,
        employmentEndDate:
          employmentEndDate as unknown as string | null | undefined,
      },
    })
      .then(() => {
        message.success('Employment info updated', 2);
        setIsFieldsTouched(false);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const hrKarkunById = data?.hrKarkunById;

  if (formDataLoading || allJobsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!hrKarkunById) return null;

  return (
    <div className="visitor-form">
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
          initialValue={hrKarkunById.employeeData?.jobId}
        />

        <DateField
          fieldName="employmentStartDate"
          fieldLabel="Start Date"
          initialValue={
            hrKarkunById.employeeData?.employmentStartDate
              ? dayjs(Number(hrKarkunById.employeeData.employmentStartDate))
              : null
          }
        />

        <DateField
          fieldName="employmentEndDate"
          fieldLabel="End Date"
          initialValue={
            hrKarkunById.employeeData?.employmentEndDate
              ? dayjs(Number(hrKarkunById.employeeData.employmentEndDate))
              : null
          }
        />

        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
          fullWidth
        />
      </Form>
    </div>
  );
};

export default EmploymentInfo;
