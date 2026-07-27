import React from 'react';
import dayjs from 'dayjs';

import { Formats } from 'meteor/idreesia-common/constants';
import { Button, Form, Row } from 'antd';
import {
  CascaderField,
  DateRangeField,
  InputCnicField,
  InputTextField,
  SelectField,
  AttendanceFilterField,
  LastTarteebFilterField,
} from '/imports/ui/modules/helpers/fields';

import { getCityMehfilCascaderData } from './utilities';

const AntButton = Button as any;
const AntFormItem = (Form as any).Item;
const AntRow = Row as any;
const TextField = InputTextField as any;
const CnicField = InputCnicField as any;
const SelectInputField = SelectField as any;
const CascaderInputField = CascaderField as any;
const DateRangeInputField = DateRangeField as any;
const AttendanceInputField = AttendanceFilterField as any;
const LastTarteebInputField = LastTarteebFilterField as any;
type FieldValue = unknown;
type AnyRecord = Record<string, any>;
interface LabelValue { label: string; value: string; }

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

export function getNameFilterField(fieldValue: FieldValue) {
  return (
    <TextField
      fieldName="name"
      fieldLabel="Name"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getCnicNumberFilterField(fieldValue: FieldValue) {
  return (
    <CnicField
      fieldName="cnicNumber"
      fieldLabel="CNIC Number"
      required={false}
      requiredMessage="Please input a valid CNIC number."
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getPhoneNumberFilterField(fieldValue: FieldValue) {
  return (
    <TextField
      fieldName="phoneNumber"
      fieldLabel="Phone Number"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getBloodGroupFilterField(fieldValue: FieldValue) {
  return (
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
      initialValue={fieldValue}
    />
  );
}

export function getUserAccountFilterField(fieldValue: FieldValue) {
  return (
    <SelectInputField
      fieldName="userAccount"
      fieldLabel="User Account"
      required={false}
      data={[
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ]}
      getDataValue={({ value }: LabelValue) => value}
      getDataText={({ label }: LabelValue) => label}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getEhadKarkunFilterField(fieldValue: FieldValue) {
  return (
    <SelectInputField
      fieldName="ehadKarkun"
      fieldLabel="Ehad Karkun"
      required={false}
      data={[
        { label: 'Yes', value: 'true' },
        { label: 'No', value: 'false' },
      ]}
      getDataValue={({ value }: LabelValue) => value}
      getDataText={({ label }: LabelValue) => label}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getAttendanceFilterField(fieldValue: FieldValue) {
  return (
    <AttendanceInputField
      fieldName="attendance"
      fieldLabel="Attendance"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getLastTarteebFilterField(fieldValue: FieldValue) {
  return (
    <LastTarteebInputField
      fieldName="lastTarteeb"
      fieldLabel="Last Tarteeb"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getMehfilDutyFilterField(fieldValue: FieldValue, duties: AnyRecord[]) {
  return (
    <SelectInputField
      fieldName="dutyId"
      fieldLabel="Duty"
      required={false}
      data={duties}
      getDataValue={({ _id }: AnyRecord) => _id}
      getDataText={({ name: _name }: AnyRecord) => _name}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getCityMehfilFilterField(fieldValue: FieldValue, cities: AnyRecord[], cityMehfils: AnyRecord[]) {
  const cityMehfilCascaderData = getCityMehfilCascaderData(cities as any, cityMehfils as any);

  return (
    <CascaderInputField
      data={cityMehfilCascaderData}
      fieldName="cityIdMehfilId"
      fieldLabel="City/Mehfil"
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getRegionFilterField(fieldValue: FieldValue, regions: string[]) {
  return (
    <SelectInputField
      fieldName="region"
      fieldLabel="Region"
      required={false}
      data={regions}
      getDataValue={(item: string) => item}
      getDataText={(item: string) => item}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getUpdatedBetweenFilterField(fieldValue: FieldValue) {
  let initialValue;
  if (fieldValue) {
    const dates = JSON.parse(fieldValue as string);
    initialValue = [
      dates[0] ? dayjs(dates[0], Formats.DATE_FORMAT) : null,
      dates[1] ? dayjs(dates[1], Formats.DATE_FORMAT) : null,
    ];
  } else {
    initialValue = [null, null];
  }

  return (
    <DateRangeInputField
      fieldName="updatedBetween"
      fieldLabel="Updated"
      fieldLayout={formItemLayout}
      initialValue={initialValue}
    />
  );
}

export function getFormButtons(handleReset: () => void) {
  return (
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
  );
}
