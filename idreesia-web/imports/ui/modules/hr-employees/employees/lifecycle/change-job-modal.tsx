import React, { useEffect } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useMutation } from '@apollo/client/react';
import { DatePicker, Form, Input, Modal } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { CHANGE_EMPLOYEE_JOB, LIFECYCLE_REFETCH_QUERIES } from '../gql';
import {
  JobAndShiftFields,
  modalFormLayout,
  toDateVariable,
  useJobsWithShifts,
} from './shared';

interface FormValues {
  jobId: string;
  jobShiftId?: string | null;
  effectiveDate: Dayjs;
  remarks?: string;
}

interface Props {
  personId: string;
  open: boolean;
  currentJobId?: string | null;
  onClose(): void;
}

/** Moves an employee to another job, and one of its shifts if it has any. */
const ChangeJobModal = ({ personId, open, currentJobId, onClose }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const { jobs, shiftsOfJob } = useJobsWithShifts();
  const jobId = Form.useWatch('jobId', form);
  const [changeEmployeeJob, { loading }] = useMutation(CHANGE_EMPLOYEE_JOB, {
    refetchQueries: LIFECYCLE_REFETCH_QUERIES,
  });

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        jobId: undefined,
        jobShiftId: undefined,
        effectiveDate: dayjs().startOf('day'),
        remarks: undefined,
      });
    }
  }, [open]);

  const handleSave = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      await changeEmployeeJob({
        variables: {
          personId,
          jobId: values.jobId,
          jobShiftId: values.jobShiftId || null,
          effectiveDate: toDateVariable(values.effectiveDate) as string,
          remarks: values.remarks || null,
        },
      });
      message.success('Job changed', 2);
      onClose();
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  return (
    <Modal
      title="Change Job"
      open={open}
      okText="Change Job"
      confirmLoading={loading}
      onOk={handleSave}
      onCancel={onClose}
      forceRender
    >
      <Form form={form} layout="horizontal" style={{ width: '100%' }}>
        <JobAndShiftFields
          jobs={jobs.filter(job => job._id !== currentJobId)}
          shiftsOfJob={shiftsOfJob}
          jobId={jobId}
          jobLabel="New Job"
          onJobChange={() => form.setFieldsValue({ jobShiftId: undefined })}
        />
        <Form.Item
          name="effectiveDate"
          label="Effective Date"
          rules={[{ required: true, message: 'Please enter the date.' }]}
          {...modalFormLayout}
        >
          <DatePicker format="DD MMM YYYY" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="remarks" label="Remarks" {...modalFormLayout}>
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangeJobModal;
