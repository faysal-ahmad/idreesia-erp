import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

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

const AntButton = Button as any;
const AntCollapse = Collapse as any;
const AntForm = Form as any;
const AntFormItem = (Form as any).Item;
const AntRow = Row as any;
const CheckboxGroupInputField = CheckboxGroupField as any;
const CnicField = InputCnicField as any;
const TextField = InputTextField as any;
const CascaderInputField = CascaderField as any;
const SelectInputField = SelectField as any;
const LastTarteebInputField = LastTarteebFilterField as any;
const RefreshControl = RefreshButton as any;
type AnyRecord = Record<string, any>;
interface LabelValue { label: string; value: string; }
interface Props extends AnyRecord { setPageParams(params: AnyRecord): void; refreshData?: () => Promise<unknown>; }
interface FilterValues extends AnyRecord { dutyIdShiftId?: string[]; karkunType?: string[]; }

const ContainerStyle = {
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
  bloodGroup,
  cnicNumber,
  dutyId,
  dutyShiftId,
  jobId,
  lastTarteeb,
  name,
  phoneNumber,
  refreshData,
  setPageParams,
  showEmployees,
  showVolunteers,
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
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    lastTarteeb,
    jobId,
    dutyIdShiftId,
    karkunType,
  }: FilterValues) => {
    setPageParams({
      pageIndex: 0,
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      lastTarteeb,
      jobId,
      dutyId: dutyIdShiftId?.[0],
      dutyShiftId: dutyIdShiftId?.[1],
      karkunType,
    });
  };

  const refreshButton = () => <RefreshControl refreshData={refreshData} />;

  if (allJobsLoading || allMSDutiesLoading || allDutyShiftsLoading)
    return null;

  const dutyShiftCascaderData = getDutyShiftCascaderData(
    (allMSDuties ?? []) as any,
    (allDutyShifts ?? []) as any
  );

  const karkunTypes: string[] = [];
  if (!showVolunteers || showVolunteers === 'true')
    karkunTypes.push('volunteers');
  if (!showEmployees || showEmployees === 'true') karkunTypes.push('employees');

  return (
    <AntCollapse
      style={ContainerStyle as any}
      items={[
        {
          key: '1',
          label: 'Filter',
          extra: refreshButton(),
          children: (
            <AntForm ref={formRef} layout="horizontal" onFinish={handleFinish}>
              <CheckboxGroupInputField
                fieldName="karkunType"
                fieldLabel="Karkun Type"
                fieldLayout={formItemLayout}
                options={[
                  { label: 'Volunteers', value: 'volunteers' },
                  { label: 'Employees', value: 'employees' },
                ]}
                initialValue={karkunTypes}
              />
              <TextField
                fieldName="name"
                fieldLabel="Name"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={name}
              />
              <CnicField
                fieldName="cnicNumber"
                fieldLabel="CNIC Number"
                required={false}
                requiredMessage="Please input a valid CNIC number."
                fieldLayout={formItemLayout}
                initialValue={cnicNumber}
              />
              <TextField
                fieldName="phoneNumber"
                fieldLabel="Phone Number"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={phoneNumber}
              />
              <SelectInputField
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
                getDataValue={({ value }: LabelValue) => value}
                getDataText={({ label }: LabelValue) => label}
                fieldLayout={formItemLayout}
                initialValue={bloodGroup}
              />
              <LastTarteebInputField
                fieldName="lastTarteeb"
                fieldLabel="Last Tarteeb"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={lastTarteeb}
              />
              <SelectInputField
                fieldName="jobId"
                fieldLabel="Job"
                required={false}
                data={allJobs}
                getDataValue={({ _id }: AnyRecord) => _id}
                getDataText={({ name: _name }: AnyRecord) => _name}
                fieldLayout={formItemLayout}
                initialValue={jobId}
              />
              <CascaderInputField
                data={dutyShiftCascaderData}
                fieldName="dutyIdShiftId"
                fieldLabel="Duty/Shift"
                fieldLayout={formItemLayout}
                initialValue={[dutyId, dutyShiftId]}
                required={false}
              />
              <AntFormItem {...buttonItemLayout}>
                <AntRow type="flex" justify="end">
                  <AntButton type="default" onClick={handleReset}>
                    Reset
                  </AntButton>
                  &nbsp;
                  <AntButton type="primary" htmlType="submit">
                    Search
                  </AntButton>
                </AntRow>
              </AntFormItem>
            </AntForm>
          ),
        },
      ]}
    />
  );
};

ListFilter.propTypes = {
  name: PropTypes.string,
  cnicNumber: PropTypes.string,
  phoneNumber: PropTypes.string,
  bloodGroup: PropTypes.string,
  lastTarteeb: PropTypes.string,
  jobId: PropTypes.string,
  dutyId: PropTypes.string,
  dutyShiftId: PropTypes.string,
  showVolunteers: PropTypes.string,
  showEmployees: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

ListFilter.defaultProps = {
  cnicNumber: '',
};

export default ListFilter;
