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

const AntDivider = Divider as any;
const AntForm = Form as any;
const AgeInputField = AgeField as any;
const CascaderInputField = CascaderField as any;
const DateInputField = DateField as any;
const EhadDurationInputField = EhadDurationField as any;
const CnicField = InputCnicField as any;
const MobileField = InputMobileField as any;
const TextField = InputTextField as any;
const SelectInputField = SelectField as any;
const SwitchInputField = SwitchField as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const AuditInfoComponent = AuditInfo as any;
type AnyRecord = Record<string, any>;
interface Props { karkun: AnyRecord; handleFinish(values: AnyRecord): void; handleCancel?(): void; cities?: AnyRecord[]; cityMehfils?: AnyRecord[]; showCityMehfilField?: boolean; allowEhadInfoUpdation?: boolean; }
interface LabelValue { label: string; value: string; }

const GeneralInfo = ({
  karkun,
  handleFinish,
  handleCancel,
  cities,
  cityMehfils,
  showCityMehfilField,
  allowEhadInfoUpdation,
}: Props) => {
  const [form] = AntForm.useForm();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const _handleFinish = (values: AnyRecord) => {
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
      <AntForm form={form} layout="horizontal" onFinish={_handleFinish} onFieldsChange={handleFieldsChange}>
        <TextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={karkun.name}
          required
          requiredMessage="Please input the name for the karkun."
        />

        <TextField
          fieldName="parentName"
          fieldLabel="S/O"
          initialValue={karkun.parentName}
          required
          requiredMessage="Please input the parent name for the karkun."
        />

        <AgeInputField
          fieldName="birthDate"
          fieldLabel="Age (years)"
          initialValue={
            karkun.birthDate ? dayjs(Number(karkun.birthDate)) : null
          }
        />

        <EhadDurationInputField
          fieldName="ehadDate"
          fieldLabel="Ehad Duration"
          initialValue={
            karkun.ehadDate ? dayjs(Number(karkun.ehadDate)) : dayjs()
          }
          required
          requiredMessage="Please specify the Ehad duration for the karkun."
        />

        <DateInputField
          fieldName="deathDate"
          fieldLabel="Date of Death"
          initialValue={
            karkun.deathDate ? dayjs(Number(karkun.deathDate)) : null
          }
        />

        <TextField
          fieldName="referenceName"
          fieldLabel="R/O"
          initialValue={karkun.referenceName}
          required
          requiredMessage="Please input the reference name for the karkun."
        />

        <CnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={karkun.cnicNumber || ''}
        />

        <MobileField
          fieldName="contactNumber1"
          fieldLabel="Mobile Number"
          initialValue={karkun.contactNumber1 || ''}
        />

        {showCityMehfilField ? (
          <CascaderInputField
            data={getCityMehfilCascaderData(cities as any, cityMehfils as any)}
            fieldName="cityIdMehfilId"
            fieldLabel="City/Mehfil"
            initialValue={[karkun.cityId, karkun.cityMehfilId]}
            required
            requiredMessage="Please select a city/mehfil from the list."
          />
        ) : null}

        <AntDivider />

        <SwitchInputField
          fieldName="ehadKarkun"
          fieldLabel="Ehad Karkun"
          disabled={!allowEhadInfoUpdation}
          initialValue={karkun.ehadKarkun}
        />

        <DateInputField
          fieldName="ehadPermissionDate"
          fieldLabel="Ehad Permission Date"
          disabled={!allowEhadInfoUpdation}
          initialValue={
            karkun.ehadPermissionDate
              ? dayjs(Number(karkun.ehadPermissionDate))
              : null
          }
        />

        <AntDivider />

        <TextField
          fieldName="contactNumber2"
          fieldLabel="Home Number"
          initialValue={karkun.contactNumber2}
          required={false}
        />

        <SelectInputField
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
          getDataValue={({ value }: LabelValue) => value}
          getDataText={({ label }: LabelValue) => label}
          initialValue={karkun.bloodGroup}
        />

        <TextField
          fieldName="emailAddress"
          fieldLabel="Email"
          initialValue={karkun.emailAddress}
          required={false}
        />

        <TextAreaField
          fieldName="currentAddress"
          fieldLabel="Current Address"
          initialValue={karkun.currentAddress}
          required={false}
        />

        <TextAreaField
          fieldName="permanentAddress"
          fieldLabel="Permanent Address"
          initialValue={karkun.permanentAddress}
          required={false}
        />

        <TextField
          fieldName="educationalQualification"
          fieldLabel="Education"
          initialValue={karkun.educationalQualification}
          required={false}
        />

        <TextAreaField
          fieldName="meansOfEarning"
          fieldLabel="Means of Earning"
          initialValue={karkun.meansOfEarning}
          required={false}
        />

        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={karkun} />
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
  allowEhadInfoUpdation: PropTypes.bool,
};

GeneralInfo.defaultProps = {
  cities: [],
  cityMehfils: [],
  showCityMehfilField: false,
  allowEhadInfoUpdation: false,
};

export default GeneralInfo;
