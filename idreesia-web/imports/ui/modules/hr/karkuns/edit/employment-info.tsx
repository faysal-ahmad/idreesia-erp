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

const AntForm = Form as any;
const DateInputField = DateField as any;
const TextAreaField = typeof InputTextAreaField !== 'undefined' ? (InputTextAreaField as any) : undefined;
const SelectInputField = SelectField as any;
const SwitchInputField = SwitchField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
type AnyRecord = Record<string, any>;
interface HistoryLike { goBack(): void; }
interface MatchLike { params: { karkunId: string; }; }
interface QueryData { hrKarkunById?: AnyRecord | null; }
interface Props { match: MatchLike; history: HistoryLike; karkunId?: string | null; }
interface FormValues extends AnyRecord { isEmployee?: boolean; jobId?: string | null; employmentStartDate?: unknown; employmentEndDate?: unknown; bankAccountDetails?: string; }

const EmploymentInfo = ({ history, karkunId, match }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { allJobs, allJobsLoading } = useAllJobs();
  const { data, loading: formDataLoading } = useQuery(HR_KARKUN_BY_ID as any, {
    variables: { _id: match.params.karkunId },
  });
  const [setHrKarkunEmploymentInfo] = useMutation(
    SET_HR_KARKUN_EMPLOYMENT_INFO as any,
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
  }: FormValues) => {
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const { hrKarkunById } = (data ?? {}) as QueryData;

  if (formDataLoading || allJobsLoading || !hrKarkunById) return null;

  return (
    <AntForm
      layout="horizontal"
      onFinish={handleFinish}
      onFieldsChange={handleFieldsChange}
    >
      <SwitchInputField
        fieldName="isEmployee"
        fieldLabel="Is Employee"
        initialValue={hrKarkunById.isEmployee || false}
      />

      <SelectInputField
        fieldName="jobId"
        fieldLabel="Current Job"
        required={false}
        data={allJobs}
        getDataValue={({ _id }: AnyRecord) => _id}
        getDataText={({ name }: AnyRecord) => name}
        initialValue={hrKarkunById.jobId}
      />

      <DateInputField
        fieldName="employmentStartDate"
        fieldLabel="Start Date"
        initialValue={
          hrKarkunById.employmentStartDate
            ? dayjs(Number(hrKarkunById.employmentStartDate))
            : null
        }
      />

      <DateInputField
        fieldName="employmentEndDate"
        fieldLabel="End Date"
        initialValue={
          hrKarkunById.employmentEndDate
            ? dayjs(Number(hrKarkunById.employmentEndDate))
            : null
        }
      />

      <TextAreaField
        fieldName="bankAccountDetails"
        fieldLabel="Bank Account Details"
        initialValue={hrKarkunById.bankAccountDetails}
        required={false}
      />

      <SaveCancelButtons
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
  );
};

EmploymentInfo.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  karkunId: PropTypes.string,
};

export default EmploymentInfo;
