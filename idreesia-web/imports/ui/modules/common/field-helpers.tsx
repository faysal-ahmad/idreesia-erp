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

export type FieldValue = string | string[] | null | undefined;
interface LabelValue { label: string; value: string; }
export interface LookupItem {
  _id?: string | null;
  name?: string | null;
}
export interface CityLookupItem extends LookupItem {}
export interface MehfilLookupItem extends LookupItem {
  cityId?: string | null;
}

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

export function getNameFilterField(fieldValue: FieldValue) {
  return (
    <InputTextField
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
    <InputCnicField
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
    <InputTextField
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
    <SelectField
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
    <SelectField
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
    <SelectField
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
    <AttendanceFilterField
      fieldName="attendance"
      fieldLabel="Attendance"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={fieldValue as string | null | undefined}
    />
  );
}

export function getLastTarteebFilterField(fieldValue: FieldValue) {
  return (
    <LastTarteebFilterField
      fieldName="lastTarteeb"
      fieldLabel="Last Tarteeb"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={fieldValue as string | null | undefined}
    />
  );
}

export function getMehfilDutyFilterField(fieldValue: FieldValue, duties: LookupItem[]) {
  return (
    <SelectField<LookupItem>
      fieldName="dutyId"
      fieldLabel="Duty"
      required={false}
      data={duties}
      getDataValue={({ _id }) => _id as string}
      getDataText={({ name }) => name}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getCityMehfilFilterField(
  fieldValue: FieldValue,
  cities: CityLookupItem[],
  cityMehfils: MehfilLookupItem[]
) {
  const cityMehfilCascaderData = getCityMehfilCascaderData(cities, cityMehfils);

  return (
    <CascaderField
      data={cityMehfilCascaderData ?? undefined}
      fieldName="cityIdMehfilId"
      fieldLabel="City/Mehfil"
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getRegionFilterField(fieldValue: FieldValue, regions: string[]) {
  return (
    <SelectField
      fieldName="region"
      fieldLabel="Region"
      required={false}
      data={regions as any}
      getDataValue={((item: string) => item) as any}
      getDataText={((item: string) => item) as any}
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
    <DateRangeField
      fieldName="updatedBetween"
      fieldLabel="Updated"
      fieldLayout={formItemLayout}
      initialValue={initialValue}
    />
  );
}

export function getFormButtons(handleReset: () => void) {
  return (
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
  );
}
