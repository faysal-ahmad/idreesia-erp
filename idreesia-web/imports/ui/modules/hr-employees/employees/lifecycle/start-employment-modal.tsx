import React, { useEffect, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useMutation, useQuery } from '@apollo/client/react';
import { Alert, DatePicker, Form, Input, Modal, Spin, Switch } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { EmploymentStatus } from 'meteor/idreesia-common/constants/hr/employment';
import { HR_EMPLOYMENT_SETTINGS } from '/imports/ui/modules/hr-employees/jobs/employment-settings';

import {
  HIRE_EMPLOYEE,
  HR_EMPLOYEE_BY_ID,
  LIFECYCLE_REFETCH_QUERIES,
  REJOIN_EMPLOYEE,
} from '../gql';
import {
  JobAndShiftFields,
  modalFormLayout,
  toDateVariable,
  useJobsWithShifts,
} from './shared';

interface FormValues {
  startDate: Dayjs;
  jobId: string;
  jobShiftId?: string | null;
  onProbation: boolean;
  probationEndDate?: Dayjs | null;
  remarks?: string;
}

interface Props {
  /** The person to hire or rejoin; the modal is open while set. */
  personId: string | null;
  /**
   * Their name, for someone not employed before: the employee query only
   * returns employees, so it has nothing to show for a new hire.
   */
  personName?: string | null;
  onClose(): void;
}

/**
 * Hires a karkun, or rejoins a former employee (the person's history
 * decides which). Probation is on by default, with its end pre-filled from
 * the HR default length.
 */
const StartEmploymentModal = ({ personId, personName, onClose }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [probationEdited, setProbationEdited] = useState(false);
  const { jobs, shiftsOfJob, loading: jobsLoading } = useJobsWithShifts();
  const { data: settingsData } = useQuery(HR_EMPLOYMENT_SETTINGS);
  const { data, loading } = useQuery(HR_EMPLOYEE_BY_ID, {
    variables: { _id: personId ?? '' },
    skip: !personId,
  });
  const mutationOptions = { refetchQueries: LIFECYCLE_REFETCH_QUERIES };
  const [hireEmployee, { loading: hiring }] = useMutation(
    HIRE_EMPLOYEE,
    mutationOptions
  );
  const [rejoinEmployee, { loading: rejoining }] = useMutation(
    REJOIN_EMPLOYEE,
    mutationOptions
  );

  const person = data?.hrEmployeeById;
  const employeeData = person?.employeeData;
  const isRejoin =
    employeeData?.employmentStatus === EmploymentStatus.EXITED ||
    (!person?.isEmployee && !!employeeData?.employmentStartDate);
  const probationMonths =
    settingsData?.hrEmploymentSettings?.defaultProbationMonths ?? 3;

  const jobId = Form.useWatch('jobId', form);
  const onProbation = Form.useWatch('onProbation', form);

  useEffect(() => {
    if (!personId) return;
    const start = dayjs().startOf('day');
    setProbationEdited(false);
    form.setFieldsValue({
      startDate: start,
      jobId: isRejoin ? (employeeData?.jobId ?? undefined) : undefined,
      jobShiftId: undefined,
      onProbation: true,
      probationEndDate: start.add(probationMonths, 'month'),
      remarks: undefined,
    });
  }, [personId, isRejoin, probationMonths]);

  const handleValuesChange = (changed: Partial<FormValues>) => {
    if ('probationEndDate' in changed) setProbationEdited(true);
    if (changed.startDate && !probationEdited) {
      form.setFieldsValue({
        probationEndDate: changed.startDate.add(probationMonths, 'month'),
      });
    }
  };

  const handleSave = async () => {
    let values: FormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    const variables = {
      personId: personId as string,
      jobId: values.jobId,
      jobShiftId: values.jobShiftId || null,
      startDate: toDateVariable(values.startDate) as string,
      onProbation: values.onProbation,
      probationEndDate: values.onProbation
        ? toDateVariable(values.probationEndDate)
        : null,
      remarks: values.remarks || null,
    };
    try {
      if (isRejoin) {
        await rejoinEmployee({ variables });
        message.success('Employee rejoined', 2);
      } else {
        await hireEmployee({ variables });
        message.success('Employee added', 2);
      }
      onClose();
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  const name = person?.sharedData?.name ?? personName;
  const previousEnd = employeeData?.employmentEndDate
    ? dayjs(Number(employeeData.employmentEndDate)).format('DD MMM YYYY')
    : null;

  return (
    <Modal
      title={isRejoin ? `Rejoin ${name ?? ''}` : `Add Employee: ${name ?? ''}`}
      open={!!personId}
      okText={isRejoin ? 'Rejoin' : 'Add Employee'}
      confirmLoading={hiring || rejoining}
      onOk={handleSave}
      onCancel={onClose}
      width={560}
      forceRender
    >
      {loading || jobsLoading ? (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      ) : null}
      {isRejoin ? (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={`Previously employed${previousEnd ? ` until ${previousEnd}` : ''}. This starts a new employment period.`}
        />
      ) : null}
      <Form
        form={form}
        layout="horizontal"
        style={{ width: '100%' }}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name="startDate"
          label={isRejoin ? 'Rejoining Date' : 'Start Date'}
          rules={[{ required: true, message: 'Please enter the start date.' }]}
          {...modalFormLayout}
        >
          <DatePicker format="DD MMM YYYY" style={{ width: '100%' }} />
        </Form.Item>
        <JobAndShiftFields
          jobs={jobs}
          shiftsOfJob={shiftsOfJob}
          jobId={jobId}
          onJobChange={() => form.setFieldsValue({ jobShiftId: undefined })}
        />
        <Form.Item
          name="onProbation"
          label="On Probation"
          valuePropName="checked"
          {...modalFormLayout}
        >
          <Switch />
        </Form.Item>
        {onProbation ? (
          <Form.Item
            name="probationEndDate"
            label="Probation Ends"
            extra={`Defaults to ${probationMonths} months after the start date.`}
            rules={[{ required: true, message: 'Please enter the probation end.' }]}
            {...modalFormLayout}
          >
            <DatePicker format="DD MMM YYYY" style={{ width: '100%' }} />
          </Form.Item>
        ) : null}
        <Form.Item name="remarks" label="Remarks" {...modalFormLayout}>
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StartEmploymentModal;
