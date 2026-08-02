import React, { useRef, useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation } from '@apollo/client/react';
import { Divider, Form, message } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
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

interface LabelValue {
  label: string;
  value: string;
}

export interface NewKarkunFormValues {
  name?: string;
  parentName?: string;
  cnicNumber?: string;
  contactNumber1?: string;
  contactNumber2?: string;
  emailAddress?: string;
  currentAddress?: string;
  permanentAddress?: string;
  bloodGroup?: string;
  educationalQualification?: string;
  meansOfEarning?: string;
  ehadDate?: unknown;
  birthDate?: unknown;
  referenceName?: string;
}

type Props = RouteComponentProps;

const NewForm = ({ history }: Props) => {
  const formRef = useRef<any>(null);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  useBreadcrumbs(['HR', 'Karkuns', 'New']);

  const [createHrKarkun] = useMutation(CREATE_HR_KARKUN, {
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
  }: NewKarkunFormValues) => {
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
          name: name ?? '',
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
          ehadDate: ehadDate as string | null | undefined,
          birthDate: birthDate as string | null | undefined,
          referenceName,
        },
      })
        .then(({ data }) => {
          const newKarkun = data?.createHrKarkun;
          if (newKarkun?._id) {
            history.push(`${paths.karkunsPath}/${newKarkun._id}`);
          }
        })
        .catch((error: Error) => {
          message.error(error.message, 5);
        });
    }
  };

  return (
    <Form
      ref={formRef}
      layout="horizontal"
      onFinish={handleFinish}
      onFieldsChange={handleFieldsChange}
    >
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input the name for the karkun."
      />

      <InputTextField
        fieldName="parentName"
        fieldLabel="S/O"
        required
        requiredMessage="Please input the parent name for the karkun."
      />

      <AgeField fieldName="birthDate" fieldLabel="Age (years)" />

      <EhadDurationField
        fieldName="ehadDate"
        fieldLabel="Ehad Duration"
        required
        requiredMessage="Please specify the Ehad duration for the karkun."
      />

      <InputTextField
        fieldName="referenceName"
        fieldLabel="R/O"
        required
        requiredMessage="Please input the reference name for the karkun."
      />

      <InputCnicField fieldName="cnicNumber" fieldLabel="CNIC Number" />

      <InputMobileField fieldName="contactNumber1" fieldLabel="Mobile Number" />

      <Divider />

      <InputTextField
        fieldName="contactNumber2"
        fieldLabel="Home Number"
        required={false}
      />

      <SelectField<LabelValue>
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
      />

      <InputTextField fieldName="emailAddress" fieldLabel="Email" required={false} />

      <InputTextAreaField
        fieldName="currentAddress"
        fieldLabel="Current Address"
        required={false}
      />
      <InputTextAreaField
        fieldName="permanentAddress"
        fieldLabel="Permanent Address"
        required={false}
      />

      <InputTextField
        fieldName="educationalQualification"
        fieldLabel="Education"
        required={false}
      />

      <InputTextAreaField
        fieldName="meansOfEarning"
        fieldLabel="Means of Earning"
        required={false}
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default NewForm;
