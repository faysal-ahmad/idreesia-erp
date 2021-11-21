import React from 'react';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { Button, Form, Row } from '/imports/ui/controls';
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

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

export function getNameFilterField(fieldValue) {
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

export function getCnicNumberFilterField(fieldValue) {
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

export function getPhoneNumberFilterField(fieldValue) {
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

export function getBloodGroupFilterField(fieldValue) {
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
      getDataValue={({ value }) => value}
      getDataText={({ label }) => label}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getEhadKarkunFilterField(fieldValue) {
  return (
    <SelectField
      fieldName="ehadKarkun"
      fieldLabel="Ehad Karkun"
      required={false}
      data={[{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]}
      getDataValue={({ value }) => value}
      getDataText={({ label }) => label}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getAttendanceFilterField(fieldValue) {
  return (
    <AttendanceFilterField
      fieldName="attendance"
      fieldLabel="Attendance"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getLastTarteebFilterField(fieldValue) {
  return (
    <LastTarteebFilterField
      fieldName="lastTarteeb"
      fieldLabel="Last Tarteeb"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getMehfilDutyFilterField(fieldValue, duties) {
  return (
    <SelectField
      fieldName="dutyId"
      fieldLabel="Duty"
      required={false}
      data={duties}
      getDataValue={({ _id }) => _id}
      getDataText={({ name: _name }) => _name}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getCityMehfilFilterField(fieldValue, cities, cityMehfils) {
  const cityMehfilCascaderData = getCityMehfilCascaderData(cities, cityMehfils);

  return (
    <CascaderField
      data={cityMehfilCascaderData}
      fieldName="cityIdMehfilId"
      fieldLabel="City/Mehfil"
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getRegionFilterField(fieldValue, regions) {
  return (
    <SelectField
      fieldName="region"
      fieldLabel="Region"
      required={false}
      data={regions}
      getDataValue={item => item}
      getDataText={item => item}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
    />
  );
}

export function getUpdatedBetweenFilterField(fieldValue) {
  let initialValue;
  if (fieldValue) {
    const dates = JSON.parse(fieldValue);
    initialValue = [
      dates[0] ? moment(dates[0], Formats.DATE_FORMAT) : null,
      dates[1] ? moment(dates[1], Formats.DATE_FORMAT) : null,
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

export function getFormButtons(handleReset, handleSubmit) {
  return (
    <Form.Item {...buttonItemLayout}>
      <Row type="flex" justify="end">
        <Button type="default" onClick={handleReset}>
          Reset
        </Button>
        &nbsp;
        <Button type="primary" onClick={handleSubmit}>
          Search
        </Button>
      </Row>
    </Form.Item>
  );
}
