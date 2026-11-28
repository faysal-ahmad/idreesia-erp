import React from 'react';
import { Form, Select } from 'antd';
import type { Dayjs } from 'dayjs';

import type { AllJobsQuery } from 'meteor/idreesia-common/types/client-operations';
import { useAllJobs } from '/imports/ui/modules/hr-employees/common/hooks';

export type JobOption = NonNullable<NonNullable<AllJobsQuery['allJobs']>[number]>;

export const modalFormLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export const toDateVariable = (value: Dayjs | null | undefined) =>
  value ? value.startOf('day').toISOString() : null;

/** The jobs, and a lookup of each job's shifts. */
export const useJobsWithShifts = () => {
  const { allJobs, allJobsLoading } = useAllJobs();
  const jobs = (allJobs ?? []).filter(
    (job): job is JobOption => !!job?._id
  );
  const shiftsOfJob = (jobId?: string | null) =>
    (jobs.find(job => job._id === jobId)?.shifts ?? []).filter(
      shift => !!shift?._id
    );
  return { jobs, shiftsOfJob, loading: allJobsLoading };
};

interface JobAndShiftFieldsProps {
  jobs: JobOption[];
  shiftsOfJob: ReturnType<typeof useJobsWithShifts>['shiftsOfJob'];
  jobId?: string | null;
  jobLabel?: string;
  onJobChange?(): void;
}

/**
 * A job select and a shift select limited to that job's shifts. The shift is
 * optional and only shown when the job has shifts.
 */
export const JobAndShiftFields = ({
  jobs,
  shiftsOfJob,
  jobId,
  jobLabel = 'Job',
  onJobChange,
}: JobAndShiftFieldsProps) => {
  const shifts = shiftsOfJob(jobId);
  return (
    <>
      <Form.Item
        name="jobId"
        label={jobLabel}
        rules={[{ required: true, message: 'Please select a job.' }]}
        {...modalFormLayout}
      >
        <Select
          showSearch
          optionFilterProp="label"
          options={jobs.map(job => ({ value: job._id, label: job.name }))}
          onChange={onJobChange}
        />
      </Form.Item>
      {shifts.length > 0 ? (
        <Form.Item name="jobShiftId" label="Shift" {...modalFormLayout}>
          <Select
            allowClear
            placeholder="No shift"
            options={shifts.map(shift => ({
              value: shift?._id,
              label: shift?.name,
            }))}
          />
        </Form.Item>
      ) : null}
    </>
  );
};
