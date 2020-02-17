import React from 'react';

import { filter } from 'meteor/idreesia-common/utilities/lodash';
import { Button, Form, Row } from '/imports/ui/controls';
import {
  CascaderField,
  InputCnicField,
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

function getCityMehfilCascaderData(allCities, allMehfils) {
  const data = allCities.map(city => {
    const cityMehfils = filter(
      allMehfils,
      mehfil => mehfil.cityId === city._id
    );

    const dataItem = {
      value: city._id,
      label: city.name,
      children: cityMehfils.map(mehfil => ({
        value: mehfil._id,
        label: mehfil.name,
      })),
    };

    return dataItem;
  });

  return data;
}

export function getNameFilterField(fieldValue, getFieldDecorator) {
  return (
    <InputTextField
      fieldName="name"
      fieldLabel="Name"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
      getFieldDecorator={getFieldDecorator}
    />
  );
}

export function getCnicNumberFilterField(fieldValue, getFieldDecorator) {
  return (
    <InputCnicField
      fieldName="cnicNumber"
      fieldLabel="CNIC Number"
      required={false}
      requiredMessage="Please input a valid CNIC number."
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
      getFieldDecorator={getFieldDecorator}
    />
  );
}

export function getPhoneNumberFilterField(fieldValue, getFieldDecorator) {
  return (
    <InputTextField
      fieldName="phoneNumber"
      fieldLabel="Phone Number"
      required={false}
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
      getFieldDecorator={getFieldDecorator}
    />
  );
}

export function getBloodGroupFilterField(fieldValue, getFieldDecorator) {
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
      getFieldDecorator={getFieldDecorator}
    />
  );
}

export function getMehfilDutyFilterField(
  fieldValue,
  getFieldDecorator,
  duties
) {
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
      getFieldDecorator={getFieldDecorator}
    />
  );
}

export function getCityMehfilFilterField(
  fieldValue,
  getFieldDecorator,
  cities,
  cityMehfils
) {
  const cityMehfilCascaderData = getCityMehfilCascaderData(cities, cityMehfils);

  return (
    <CascaderField
      data={cityMehfilCascaderData}
      fieldName="cityIdMehfilId"
      fieldLabel="City/Mehfil"
      fieldLayout={formItemLayout}
      initialValue={fieldValue}
      getFieldDecorator={getFieldDecorator}
    />
  );
}

export function getRegionFilterField(fieldValue, getFieldDecorator, regions) {
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
      getFieldDecorator={getFieldDecorator}
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
