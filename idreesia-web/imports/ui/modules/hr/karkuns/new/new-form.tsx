import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client/react';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  AgeField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_HR_KARKUN } from '../gql';

const AntDivider = Divider as any;
const AntForm = Form as any;
const AgeInputField = AgeField as any;
const EhadDurationInputField = EhadDurationField as any;
const CnicField = InputCnicField as any;
const MobileField = InputMobileField as any;
const TextField = InputTextField as any;
const SelectInputField = SelectField as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface HistoryLike { goBack(): void; push(path: string): void; }
interface FormValues { name?: string; parentName?: string; cnicNumber?: string; contactNumber1?: string; contactNumber2?: string; emailAddress?: string; currentAddress?: string; permanentAddress?: string; bloodGroup?: string; educationalQualification?: string; meansOfEarning?: string; ehadDate?: unknown; birthDate?: unknown; referenceName?: string; }
interface Props { history: HistoryLike; }
interface LabelValue { label: string; value: string; }

const NewForm = ({ history }: Props) => {
  const formRef = useRef<any>(null);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createHrKarkun] = useMutation(CREATE_HR_KARKUN as any, {
    refetchQueries: ['pagedHrKarkuns'],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({
    name,
    parentName,
    cnicNumber,
    contactNumber1,
    contactNumber2,
    emailAddress,
    currentAddress,
    permanentAddress,
    bloodGroup,
    educationalQualification,
    meansOfEarning,
    ehadDate,
    birthDate,
    referenceName,
  }: FormValues) => {
    if (!cnicNumber && !contactNumber1) {
      formRef.current?.setFields([
        {
          name: 'cnicNumber',
          errors: ['Please input the CNIC or Mobile Number for the person'],
        },
        {
          name: 'contactNumber1',
          errors: ['Please input the CNIC or Mobile Number for the person'],
        },
      ]);
    } else {
      createHrKarkun({
        variables: {
          name,
          parentName,
          cnicNumber,
          contactNumber1,
          contactNumber2,
          emailAddress,
          currentAddress,
          permanentAddress,
          bloodGroup,
          educationalQualification,
          meansOfEarning,
          ehadDate,
          birthDate,
          referenceName,
        },
      })
        .then(({ data }: any) => {
          const newKarkun = data.createHrKarkun;
          history.push(`${paths.karkunsPath}/${newKarkun._id}`);
        })
        .catch((error: Error) => {
          message.error(error.message, 5);
        });
    }
  };

  return (
    <AntForm
      ref={formRef}
      layout="horizontal"
      onFinish={handleFinish}
      onFieldsChange={handleFieldsChange}
    >
      <TextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input the name for the karkun."
      />

      <TextField
        fieldName="parentName"
        fieldLabel="S/O"
        required
        requiredMessage="Please input the parent name for the karkun."
      />

      <AgeInputField fieldName="birthDate" fieldLabel="Age (years)" />

      <EhadDurationInputField
        fieldName="ehadDate"
        fieldLabel="Ehad Duration"
        required
        requiredMessage="Please specify the Ehad duration for the karkun."
      />

      <TextField
        fieldName="referenceName"
        fieldLabel="R/O"
        required
        requiredMessage="Please input the reference name for the karkun."
      />

      <CnicField fieldName="cnicNumber" fieldLabel="CNIC Number" />

      <MobileField fieldName="contactNumber1" fieldLabel="Mobile Number" />

      <AntDivider />

      <TextField
        fieldName="contactNumber2"
        fieldLabel="Home Number"
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
      />

      <TextField
        fieldName="emailAddress"
        fieldLabel="Email"
        required={false}
      />

      <TextAreaField
        fieldName="currentAddress"
        fieldLabel="Current Address"
        required={false}
      />
      <TextAreaField
        fieldName="permanentAddress"
        fieldLabel="Permanent Address"
        required={false}
      />

      <TextField
        fieldName="educationalQualification"
        fieldLabel="Education"
        required={false}
      />

      <TextAreaField
        fieldName="meansOfEarning"
        fieldLabel="Means of Earning"
        required={false}
      />
      <SaveCancelButtons
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default flowRight(
  WithBreadcrumbs(['HR', 'Karkuns', 'New'])
)(NewForm as any);
