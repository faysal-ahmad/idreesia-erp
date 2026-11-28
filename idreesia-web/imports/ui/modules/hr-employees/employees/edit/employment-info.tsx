import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Button,
  Collapse,
  Descriptions,
  Form,
  Select,
  Space,
  Spin,
  Tag,
  type CollapseProps,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  EmploymentStatus,
  EmploymentStatusNames,
  type EmploymentStatusValue,
  WORKING_DAYS,
} from 'meteor/idreesia-common/constants/hr/employment';
import {
  DateField,
  InputTextAreaField,
  FormButtonsSaveCancel,
  WeekDaysField,
} from '/imports/ui/modules/helpers/fields';
import {
  PersonPickerField,
  type PickedPerson,
} from '/imports/ui/modules/helpers/controls';
import { HrEmployeesSubModulePaths as paths } from '/imports/ui/modules/hr-employees';
import {
  formatShiftTime,
} from '/imports/ui/modules/helpers/shifts';

import {
  HR_EMPLOYEE_BY_ID,
  SET_HR_EMPLOYEE_EMPLOYMENT_INFO,
  hrReportsToSource,
} from '../gql';
import ChangeJobModal from '../lifecycle/change-job-modal';
import ConfirmEmployeeModal from '../lifecycle/confirm-employee-modal';
import ExitEmployeeModal from '../lifecycle/exit-employee-modal';
import StartEmploymentModal from '../lifecycle/start-employment-modal';
import { useJobsWithShifts } from '../lifecycle/shared';

interface Props {
  history: History;
  employeeId: string;
}

interface FormValues {
  jobShiftId?: string | null;
  workingDays?: string[];
  reportsTo?: PickedPerson | null;
  employmentStartDate?: Dayjs | null;
  probationEndDate?: Dayjs | null;
  confirmationDate?: Dayjs | null;
  employmentEndDate?: Dayjs | null;
  bankAccountDetails?: string | null;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const toDay = (value?: string | null) => (value ? dayjs(Number(value)) : null);
const formatDay = (value?: string | null) =>
  value ? dayjs(Number(value)).format('DD MMM YYYY') : '-';
const toDateVariable = (value?: Dayjs | null) =>
  value ? value.startOf('day').toISOString() : null;

const STATUS_COLORS: Record<EmploymentStatusValue, string> = {
  probation: 'gold',
  confirmed: 'green',
  exited: 'default',
};

type OpenModal = 'confirm' | 'change-job' | 'exit' | 'start' | null;

const EmploymentInfo = ({ history, employeeId }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const { shiftsOfJob, loading: jobsLoading } = useJobsWithShifts();
  const { data, loading } = useQuery(HR_EMPLOYEE_BY_ID, {
    variables: { _id: employeeId },
  });
  const [setEmploymentInfo] = useMutation(SET_HR_EMPLOYEE_EMPLOYMENT_INFO, {
    refetchQueries: ['pagedHrEmployees', 'hrEmployeeById'],
  });

  const person = data?.hrEmployeeById;
  const employeeData = person?.employeeData;

  if (loading || jobsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!person) return null;

  // Records from before the lifecycle have no status yet.
  let legacyStatus: EmploymentStatusValue | null = null;
  if (person.isEmployee) legacyStatus = EmploymentStatus.CONFIRMED;
  else if (employeeData?.employmentStartDate) {
    legacyStatus = EmploymentStatus.EXITED;
  }
  const status = (employeeData?.employmentStatus ??
    legacyStatus) as EmploymentStatusValue | null;
  const isCurrent =
    status === EmploymentStatus.PROBATION ||
    status === EmploymentStatus.CONFIRMED;
  const shifts = shiftsOfJob(employeeData?.jobId);
  const reportsTo = employeeData?.reportsTo;

  const handleFinish = (values: FormValues) => {
    setEmploymentInfo({
      variables: {
        _id: employeeId,
        jobShiftId: values.jobShiftId || null,
        workingDays: values.workingDays ?? null,
        reportsToPersonId: values.reportsTo?._id ?? null,
        employmentStartDate: toDateVariable(values.employmentStartDate),
        probationEndDate:
          status === EmploymentStatus.PROBATION
            ? toDateVariable(values.probationEndDate)
            : undefined,
        confirmationDate:
          status === EmploymentStatus.CONFIRMED
            ? toDateVariable(values.confirmationDate)
            : undefined,
        employmentEndDate:
          status === EmploymentStatus.EXITED
            ? toDateVariable(values.employmentEndDate)
            : undefined,
        bankAccountDetails: values.bankAccountDetails || null,
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

  const actions = (
    <Space wrap>
      {status === EmploymentStatus.PROBATION ? (
        <Button onClick={() => setOpenModal('confirm')}>Confirm</Button>
      ) : null}
      {isCurrent ? (
        <>
          <Button onClick={() => setOpenModal('change-job')}>Change Job</Button>
          <Button danger onClick={() => setOpenModal('exit')}>
            End Employment
          </Button>
        </>
      ) : null}
      {!isCurrent ? (
        <Button type="primary" onClick={() => setOpenModal('start')}>
          {status === EmploymentStatus.EXITED ? 'Rejoin' : 'Hire'}
        </Button>
      ) : null}
    </Space>
  );

  const jobShift = employeeData?.jobShift;
  const shiftText = jobShift?.name
    ? [
        jobShift.name,
        [formatShiftTime(jobShift.startTime), formatShiftTime(jobShift.endTime)]
          .filter(Boolean)
          .join(' – '),
      ]
        .filter(Boolean)
        .join(', ')
    : '-';

  const sections: CollapseProps['items'] = [
    {
      key: 'employment',
      label: 'Employment',
      forceRender: true,
      children: (
        <>
          <Descriptions
            column={1}
            size="small"
            labelStyle={{ width: 180 }}
            items={[
              {
                key: 'status',
                label: 'Status',
                children: status ? (
                  <Tag color={STATUS_COLORS[status]}>
                    {EmploymentStatusNames[status]}
                  </Tag>
                ) : (
                  'Not employed'
                ),
              },
              {
                key: 'job',
                label: 'Job',
                children: employeeData?.job?.name ?? '-',
              },
              { key: 'shift', label: 'Shift', children: shiftText },
              {
                key: 'start',
                label: 'Start Date',
                children: formatDay(employeeData?.employmentStartDate),
              },
              ...(status === EmploymentStatus.PROBATION
                ? [
                    {
                      key: 'probation',
                      label: 'Probation Ends',
                      children: formatDay(employeeData?.probationEndDate),
                    },
                  ]
                : []),
              ...(status === EmploymentStatus.CONFIRMED
                ? [
                    {
                      key: 'confirmed',
                      label: 'Confirmed On',
                      children: formatDay(employeeData?.confirmationDate),
                    },
                  ]
                : []),
              ...(status === EmploymentStatus.EXITED
                ? [
                    {
                      key: 'end',
                      label: 'End Date',
                      children: formatDay(employeeData?.employmentEndDate),
                    },
                  ]
                : []),
            ]}
          />
          <div style={{ marginTop: 12 }}>{actions}</div>
        </>
      ),
    },
    {
      key: 'schedule',
      label: 'Schedule & Reporting',
      forceRender: true,
      children: (
        <>
          <Form.Item
            name="jobShiftId"
            label="Shift"
            initialValue={employeeData?.jobShiftId ?? undefined}
            extra={
              shifts.length === 0
                ? "The employee's job has no shifts."
                : undefined
            }
            {...formItemLayout}
          >
            <Select
              allowClear
              placeholder="No shift"
              disabled={shifts.length === 0}
              options={shifts.map(shift => ({
                value: shift?._id,
                label: shift?.name,
              }))}
            />
          </Form.Item>
          <WeekDaysField
            fieldName="workingDays"
            fieldLabel="Working Days"
            required
            requiredMessage="Please select at least one working day."
            initialValue={
              employeeData?.workingDays?.length
                ? (employeeData.workingDays.filter(Boolean) as string[])
                : [...WORKING_DAYS]
            }
          />
          <PersonPickerField
            fieldName="reportsTo"
            fieldLabel="Reports To"
            source={hrReportsToSource}
            drawerTitle="Select whom the employee reports to"
            placeholder="No one"
            initialValue={
              reportsTo?._id
                ? { _id: reportsTo._id, name: reportsTo.sharedData?.name }
                : null
            }
          />
          <Form.Item
            noStyle
            shouldUpdate={(prev, next) => prev.reportsTo !== next.reportsTo}
          >
            {({ getFieldValue }) =>
              getFieldValue('reportsTo') ? (
                <Form.Item wrapperCol={{ offset: 6, span: 14 }}>
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0 }}
                    onClick={() => {
                      form.setFieldValue('reportsTo', null);
                      setIsFieldsTouched(true);
                    }}
                  >
                    Clear reports to
                  </Button>
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </>
      ),
    },
    {
      key: 'details',
      label: 'Dates & Bank Details',
      forceRender: true,
      children: (
        <>
          {status ? (
            <DateField
              fieldName="employmentStartDate"
              fieldLabel="Start Date"
              required
              requiredMessage="Please enter the start date."
              initialValue={toDay(employeeData?.employmentStartDate)}
            />
          ) : null}
          {status === EmploymentStatus.PROBATION ? (
            <DateField
              fieldName="probationEndDate"
              fieldLabel="Probation Ends"
              initialValue={toDay(employeeData?.probationEndDate)}
            />
          ) : null}
          {status === EmploymentStatus.CONFIRMED ? (
            <DateField
              fieldName="confirmationDate"
              fieldLabel="Confirmed On"
              initialValue={toDay(employeeData?.confirmationDate)}
            />
          ) : null}
          {status === EmploymentStatus.EXITED ? (
            <DateField
              fieldName="employmentEndDate"
              fieldLabel="End Date"
              initialValue={toDay(employeeData?.employmentEndDate)}
            />
          ) : null}
          <InputTextAreaField
            fieldName="bankAccountDetails"
            fieldLabel="Bank Account Details"
            initialValue={employeeData?.bankAccountDetails}
            required={false}
          />
        </>
      ),
    },
  ];

  return (
    <div className="visitor-form">
      <Form
        form={form}
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={() => setIsFieldsTouched(true)}
      >
        <Collapse
          className="visitor-form-sections"
          defaultActiveKey={['employment', 'schedule', 'details']}
          items={sections}
        />
        {status ? (
          <FormButtonsSaveCancel
            handleCancel={() => history.push(paths.employeesPath)}
            isFieldsTouched={isFieldsTouched}
            fullWidth
          />
        ) : null}
      </Form>

      <ConfirmEmployeeModal
        personId={employeeId}
        open={openModal === 'confirm'}
        probationEndDate={toDay(employeeData?.probationEndDate)}
        onClose={() => setOpenModal(null)}
      />
      <ChangeJobModal
        personId={employeeId}
        open={openModal === 'change-job'}
        currentJobId={employeeData?.jobId}
        onClose={() => setOpenModal(null)}
      />
      <ExitEmployeeModal
        personId={openModal === 'exit' ? employeeId : null}
        personName={person.sharedData?.name}
        onClose={() => setOpenModal(null)}
      />
      <StartEmploymentModal
        personId={openModal === 'start' ? employeeId : null}
        onClose={() => setOpenModal(null)}
      />
    </div>
  );
};

export default EmploymentInfo;
