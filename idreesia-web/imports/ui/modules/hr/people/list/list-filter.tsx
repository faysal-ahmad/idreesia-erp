import React, { useRef, type CSSProperties } from 'react';
import { Button, Collapse, Form, Row } from 'antd';

import type { AllJobsQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  CheckboxGroupField,
  InputCnicField,
  InputTextField,
  CascaderField,
  SelectField,
  LastTarteebFilterField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';
import {
  useAllJobs,
  useAllMSDuties,
  useAllDutyShifts,
} from '/imports/ui/modules/hr/common/composers';

interface LabelValue {
  label: string;
  value: string;
}

export interface PageParams {
  pageIndex?: number;
  pageSize?: number;
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  lastTarteeb?: string | null;
  jobId?: string | null;
  dutyId?: string | null;
  dutyShiftId?: string | null;
  karkunType?: string[];
}

interface FilterFormValues {
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  bloodGroup?: string;
  lastTarteeb?: string;
  jobId?: string;
  dutyIdShiftId?: string[];
  karkunType?: string[];
}

interface Props {
  setPageParams(params: PageParams): void;
  refreshData?: () => Promise<unknown>;
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  bloodGroup?: string;
  lastTarteeb?: string;
  jobId?: string;
  dutyId?: string;
  dutyShiftId?: string;
  showVolunteers?: string;
  showEmployees?: string;
}

type Job = NonNullable<NonNullable<AllJobsQuery['allJobs']>[number]>;

const ContainerStyle: CSSProperties = {
  width: '500px',
};

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

const ListFilter = ({
  showVolunteers,
  showEmployees,
  name,
  cnicNumber = '',
  phoneNumber,
  bloodGroup,
  lastTarteeb,
  jobId,
  dutyId,
  dutyShiftId,
  setPageParams,
  refreshData,
}: Props) => {
  const formRef = useRef<any>(null);
  const { allJobs, allJobsLoading } = useAllJobs();
  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { allDutyShifts, allDutyShiftsLoading } = useAllDutyShifts();

  const handleReset = () => {
    formRef.current?.resetFields();
    setPageParams({
      pageIndex: 0,
      name: null,
      cnicNumber: null,
      phoneNumber: null,
      bloodGroup: null,
      lastTarteeb: null,
      jobId: null,
      dutyId: null,
      dutyShiftId: null,
      karkunType: ['volunteers', 'employees'],
    });
  };

  const handleFinish = ({
    name: filterName,
    cnicNumber: filterCnicNumber,
    phoneNumber: filterPhoneNumber,
    bloodGroup: filterBloodGroup,
    lastTarteeb: filterLastTarteeb,
    jobId: filterJobId,
    dutyIdShiftId,
    karkunType,
  }: FilterFormValues) => {
    setPageParams({
      pageIndex: 0,
      name: filterName,
      cnicNumber: filterCnicNumber,
      phoneNumber: filterPhoneNumber,
      bloodGroup: filterBloodGroup,
      lastTarteeb: filterLastTarteeb,
      jobId: filterJobId,
      dutyId: dutyIdShiftId?.[0],
      dutyShiftId: dutyIdShiftId?.[1],
      karkunType,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  if (allJobsLoading || allMSDutiesLoading || allDutyShiftsLoading) return null;

  const dutyShiftCascaderData = getDutyShiftCascaderData(
    (allMSDuties ?? []).filter(
      (duty): duty is NonNullable<typeof duty> => duty != null
    ),
    (allDutyShifts ?? []).filter(
      (shift): shift is NonNullable<typeof shift> => shift != null
    )
  );

  const karkunTypes: string[] = [];
  if (!showVolunteers || showVolunteers === 'true') karkunTypes.push('volunteers');
  if (!showEmployees || showEmployees === 'true') karkunTypes.push('employees');

  return (
    <Collapse
      style={ContainerStyle}
      items={[
        {
          key: '1',
          label: 'Filter',
          extra: refreshButton(),
          children: (
            <Form ref={formRef} layout="horizontal" onFinish={handleFinish}>
              <CheckboxGroupField
                fieldName="karkunType"
                fieldLabel="Karkun Type"
                fieldLayout={formItemLayout}
                options={[
                  { label: 'Volunteers', value: 'volunteers' },
                  { label: 'Employees', value: 'employees' },
                ]}
                initialValue={karkunTypes}
              />
              <InputTextField
                fieldName="name"
                fieldLabel="Name"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={name}
              />
              <InputCnicField
                fieldName="cnicNumber"
                fieldLabel="CNIC Number"
                required={false}
                requiredMessage="Please input a valid CNIC number."
                fieldLayout={formItemLayout}
                initialValue={cnicNumber}
              />
              <InputTextField
                fieldName="phoneNumber"
                fieldLabel="Phone Number"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={phoneNumber}
              />
              <SelectField<LabelValue>
                fieldName="bloodGroup"
                fieldLabel="Blood Group"
                required={false}
                data={[
                  { label: 'A-', value: 'A-' },
                  { label: 'A+', value: 'Aplus' },
                  { label: 'B-', value: 'B-' },
                  { label: 'B+', value: 'Bplus' },
                  { label: 'AB-', value: 'AB-' },
                  { label: 'AB+', value: 'ABplus' },
                  { label: 'O-', value: 'O-' },
                  { label: 'O+', value: 'Oplus' },
                ]}
                getDataValue={({ value }) => value}
                getDataText={({ label }) => label}
                fieldLayout={formItemLayout}
                initialValue={bloodGroup}
              />
              <LastTarteebFilterField
                fieldName="lastTarteeb"
                fieldLabel="Last Tarteeb"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={lastTarteeb}
              />
              <SelectField<Job>
                fieldName="jobId"
                fieldLabel="Job"
                required={false}
                data={(allJobs ?? []).filter(
                  (job): job is Job => job != null
                )}
                getDataValue={({ _id }) => _id ?? ''}
                getDataText={({ name: jobName }) => jobName ?? ''}
                fieldLayout={formItemLayout}
                initialValue={jobId}
              />
              <CascaderField
                data={dutyShiftCascaderData}
                fieldName="dutyIdShiftId"
                fieldLabel="Duty/Shift"
                fieldLayout={formItemLayout}
                initialValue={[dutyId, dutyShiftId]}
                required={false}
              />
              <Form.Item {...buttonItemLayout}>
                <Row justify="end">
                  <Button type="default" onClick={handleReset}>
                    Reset
                  </Button>
                  &nbsp;
                  <Button type="primary" htmlType="submit">
                    Search
                  </Button>
                </Row>
              </Form.Item>
            </Form>
          ),
        },
      ]}
    />
  );
};

export default ListFilter;
