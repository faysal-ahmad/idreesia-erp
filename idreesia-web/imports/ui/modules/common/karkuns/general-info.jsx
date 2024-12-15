import React, { useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Divider, Form } from 'antd';

import {
  AgeField,
  CascaderField,
  DateField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  SwitchField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';
import { getCityMehfilCascaderData } from '/imports/ui/modules/common/utilities';

const GeneralInfo = ({
  karkun,
  handleFinish,
  handleCancel,
  cities,
  cityMehfils,
  showCityMehfilField,
}) => {
  const [form] = Form.useForm();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const _handleFinish = values => {
    const { cnicNumber, contactNumber1 } = values;
    if (!cnicNumber && !contactNumber1) {
      form.setFields([
        {
          name: "cnicNumber",
          errors: ['Please input the CNIC or Mobile Number for the person'],
        },
        {
          name: "contactNumber1",
          errors: ['Please input the CNIC or Mobile Number for the person'],
        },
      ]);
    } else {
      handleFinish(values);
    }
  };

  return (
    <>
      <Form form={form} layout="horizontal" onFinish={_handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={karkun.name}
          required
          requiredMessage="Please input the name for the karkun."
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          initialValue={karkun.parentName}
          required
          requiredMessage="Please input the parent name for the karkun."
        />

        <AgeField
          fieldName="birthDate"
          fieldLabel="Age (years)"
          initialValue={
            karkun.birthDate ? dayjs(Number(karkun.birthDate)) : null
          }
        />

        <EhadDurationField
          fieldName="ehadDate"
          fieldLabel="Ehad Duration"
          initialValue={
            karkun.ehadDate ? dayjs(Number(karkun.ehadDate)) : dayjs()
          }
          required
          requiredMessage="Please specify the Ehad duration for the karkun."
        />

        <DateField
          fieldName="deathDate"
          fieldLabel="Date of Death"
          initialValue={
            karkun.deathDate ? dayjs(Number(karkun.deathDate)) : null
          }
        />

        <InputTextField
          fieldName="referenceName"
          fieldLabel="R/O"
          initialValue={karkun.referenceName}
          required
          requiredMessage="Please input the reference name for the karkun."
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={karkun.cnicNumber || ''}
        />

        <InputMobileField
          fieldName="contactNumber1"
          fieldLabel="Mobile Number"
          initialValue={karkun.contactNumber1 || ''}
        />

        {showCityMehfilField ? (
          <CascaderField
            data={getCityMehfilCascaderData(cities, cityMehfils)}
            fieldName="cityIdMehfilId"
            fieldLabel="City/Mehfil"
            initialValue={[karkun.cityId, karkun.cityMehfilId]}
            required
            requiredMessage="Please select a city/mehfil from the list."
          />
        ) : null}

        <Divider />

        <SwitchField
          fieldName="ehadKarkun"
          fieldLabel="Ehad Karkun"
          initialValue={karkun.ehadKarkun}
        />

        <DateField
          fieldName="ehadPermissionDate"
          fieldLabel="Ehad Permission Date"
          initialValue={
            karkun.ehadPermissionDate
              ? dayjs(Number(karkun.ehadPermissionDate))
              : null
          }
        />

        <Divider />

        <InputTextField
          fieldName="contactNumber2"
          fieldLabel="Home Number"
          initialValue={karkun.contactNumber2}
          required={false}
        />

        <SelectField
          fieldName="bloodGroup"
          fieldLabel="Blood Group"
          required={false}
          data={[
            { label: 'A-', value: 'A-' },
            { label: 'A+', value: 'A+' },
            { label: 'B-', value: 'B-' },
            { label: 'B+', value: 'B+' },
            { label: 'AB-', value: 'AB-' },
            { label: 'AB+', value: 'AB+' },
            { label: 'O-', value: 'O-' },
            { label: 'O+', value: 'O+' },
          ]}
          getDataValue={({ value }) => value}
          getDataText={({ label }) => label}
          initialValue={karkun.bloodGroup}
        />

        <InputTextField
          fieldName="emailAddress"
          fieldLabel="Email"
          initialValue={karkun.emailAddress}
          required={false}
        />

        <InputTextAreaField
          fieldName="currentAddress"
          fieldLabel="Current Address"
          initialValue={karkun.currentAddress}
          required={false}
        />

        <InputTextAreaField
          fieldName="permanentAddress"
          fieldLabel="Permanent Address"
          initialValue={karkun.permanentAddress}
          required={false}
        />

        <InputTextField
          fieldName="educationalQualification"
          fieldLabel="Education"
          initialValue={karkun.educationalQualification}
          required={false}
        />

        <InputTextAreaField
          fieldName="meansOfEarning"
          fieldLabel="Means of Earning"
          initialValue={karkun.meansOfEarning}
          required={false}
        />

        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={karkun} />
    </>
  );
};

GeneralInfo.propTypes = {
  karkun: PropTypes.object,
  handleFinish: PropTypes.func,
  handleCancel: PropTypes.func,

  cities: PropTypes.array,
  cityMehfils: PropTypes.array,
  showCityMehfilField: PropTypes.bool,
};

GeneralInfo.defaultProps = {
  cities: [],
  cityMehfils: [],
  showCityMehfilField: false,
};

export default GeneralInfo;
