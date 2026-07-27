import React, { useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Divider, Form } from 'antd';

import {
  useDistinctCities,
  useDistinctCountries,
} from 'meteor/idreesia-common/hooks/security';
import {
  AgeField,
  AutoCompleteField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

const AntDivider = Divider as any;
const AntForm = Form as any;
const AgeInputField = AgeField as any;
const AutoCompleteInputField = AutoCompleteField as any;
const EhadDurationInputField = EhadDurationField as any;
const CnicField = InputCnicField as any;
const MobileField = InputMobileField as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
type AnyRecord = Record<string, any>;
interface Props { visitor?: AnyRecord; handleFinish(values: AnyRecord): void; handleCancel?(): void; }
const AuditInfoComponent = AuditInfo as any;

const GeneralInfo = ({ visitor, handleFinish, handleCancel }: Props) => {
  const [form] = AntForm.useForm();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { distinctCities, distinctCitiesLoading } = useDistinctCities();
  const {
    distinctCountries,
    distinctCountriesLoading,
  } = useDistinctCountries();

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const _handleFinish = (values: AnyRecord) => {
    const { cnicNumber, contactNumber1 } = values;
    if (!cnicNumber && !contactNumber1) {
      form.setFields([
        { name: 'cnicNumber', errors: ['Please input the CNIC or Mobile Number for the person'] },
        { name: 'contactNumber1', errors: ['Please input the CNIC or Mobile Number for the person'] },
      ]);
    } else {
      handleFinish(values);
    }
  };

  if (distinctCitiesLoading || distinctCountriesLoading) return null;

  return (
    <>
      <AntForm form={form} layout="horizontal" onFinish={_handleFinish} onFieldsChange={handleFieldsChange}>
        <TextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input the name for the person."
          initialValue={(visitor ?? {}).name}
        />

        <TextField
          fieldName="parentName"
          fieldLabel="S/O"
          required
          requiredMessage="Please input the parent name for the person."
          initialValue={(visitor ?? {}).parentName}
        />

        <AgeInputField
          fieldName="birthDate"
          fieldLabel="Age (years)"
          initialValue={
            (visitor ?? {}).birthDate ? dayjs(Number((visitor ?? {}).birthDate)) : null
          }
        />

        <AutoCompleteInputField
          fieldName="city"
          fieldLabel="City"
          dataSource={distinctCities}
          required
          requiredMessage="Please input the city for the person."
          initialValue={(visitor ?? {}).city}
        />

        <AutoCompleteInputField
          fieldName="country"
          fieldLabel="Country"
          dataSource={distinctCountries}
          required
          requiredMessage="Please input the country for the person."
          initialValue={(visitor ?? {}).country}
        />

        <TextAreaField
          fieldName="currentAddress"
          fieldLabel="Current Address"
          required={false}
          initialValue={(visitor ?? {}).currentAddress}
        />

        <TextAreaField
          fieldName="permanentAddress"
          fieldLabel="Permanent Address"
          required={false}
          initialValue={(visitor ?? {}).permanentAddress}
        />

        <AntDivider />

        <EhadDurationInputField
          fieldName="ehadDate"
          fieldLabel="Ehad Duration"
          required
          requiredMessage="Please specify the Ehad duration for the person."
          initialValue={dayjs(Number((visitor ?? {}).ehadDate))}
        />

        <TextField
          fieldName="referenceName"
          fieldLabel="R/O"
          required
          requiredMessage="Please input the reference name for the person."
          initialValue={(visitor ?? {}).referenceName}
        />

        <CnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={(visitor ?? {}).cnicNumber}
        />

        <MobileField
          fieldName="contactNumber1"
          fieldLabel="Mobile Number"
          initialValue={(visitor ?? {}).contactNumber1}
        />

        <TextField
          fieldName="contactNumber2"
          fieldLabel="Home Number"
          initialValue={(visitor ?? {}).contactNumber2}
        />

        <AntDivider />

        <TextField
          fieldName="educationalQualification"
          fieldLabel="Education"
          initialValue={(visitor ?? {}).educationalQualification}
          required={false}
        />

        <TextAreaField
          fieldName="meansOfEarning"
          fieldLabel="Means of Earning"
          initialValue={(visitor ?? {}).meansOfEarning}
          required={false}
        />

        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={visitor} />
    </>
  );
};

GeneralInfo.propTypes = {
  visitor: PropTypes.object,
  handleFinish: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default GeneralInfo;
