import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation } from '@apollo/client/react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Collapse,
  Form,
  Space,
  type CollapseProps,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
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
  ehadDate?: Dayjs;
  birthDate?: Dayjs | null;
  referenceName?: string;
}

const BLOOD_GROUP_OPTIONS: LabelValue[] = [
  { label: 'A-', value: 'A-' },
  { label: 'A+', value: 'A+' },
  { label: 'B-', value: 'B-' },
  { label: 'B+', value: 'B+' },
  { label: 'AB-', value: 'AB-' },
  { label: 'AB+', value: 'AB+' },
  { label: 'O-', value: 'O-' },
  { label: 'O+', value: 'O+' },
];

type Props = RouteComponentProps;

const NewForm = ({ history }: Props) => {
  const [form] = Form.useForm();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  useDynamicBreadcrumbs(['HR', 'Karkuns', 'New']);

  const [createHrKarkun] = useMutation(CREATE_HR_KARKUN, {
    refetchQueries: ['hrKarkunsPagedHrKarkuns'],
  });

  const handleCancel = () => {
    history.push(paths.karkunsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = async (values: NewKarkunFormValues) => {
    const { cnicNumber, contactNumber1 } = values;
    if (!cnicNumber && !contactNumber1) {
      form.setFields([
        {
          name: 'cnicNumber',
          errors: ['Please input the CNIC or Mobile Number for the karkun'],
        },
        {
          name: 'contactNumber1',
          errors: ['Please input the CNIC or Mobile Number for the karkun'],
        },
      ]);
      return;
    }

    try {
      const { data } = await createHrKarkun({
        variables: {
          name: values.name ?? '',
          parentName: values.parentName,
          cnicNumber: values.cnicNumber,
          contactNumber1: values.contactNumber1,
          contactNumber2: values.contactNumber2,
          emailAddress: values.emailAddress,
          currentAddress: values.currentAddress,
          permanentAddress: values.permanentAddress,
          bloodGroup: values.bloodGroup,
          educationalQualification: values.educationalQualification,
          meansOfEarning: values.meansOfEarning,
          ehadDate: values.ehadDate as unknown as string | null | undefined,
          birthDate: values.birthDate as unknown as string | null | undefined,
          referenceName: values.referenceName,
        },
      });
      const newKarkun = data?.createHrKarkun;
      if (newKarkun?._id) {
        message.success('Karkun created', 2);
        history.push(paths.karkunsEditFormPath(newKarkun._id));
      }
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  const personalItem: NonNullable<CollapseProps['items']>[number] = {
    key: 'personal',
    label: 'Personal Information',
    forceRender: true,
    children: (
      <>
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
        <InputCnicField fieldName="cnicNumber" fieldLabel="CNIC Number" />
        <SelectField<LabelValue>
          fieldName="bloodGroup"
          fieldLabel="Blood Group"
          required={false}
          data={BLOOD_GROUP_OPTIONS}
          getDataValue={({ value }) => value}
          getDataText={({ label }) => label}
        />
      </>
    ),
  };

  const remainingItems: CollapseProps['items'] = [
    {
      key: 'contact',
      label: 'Contact Information',
      forceRender: true,
      children: (
        <>
          <InputMobileField
            fieldName="contactNumber1"
            fieldLabel="Mobile Number"
          />
          <InputTextField
            fieldName="contactNumber2"
            fieldLabel="Home Number"
            required={false}
          />
          <InputTextField
            fieldName="emailAddress"
            fieldLabel="Email"
            required={false}
          />
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
        </>
      ),
    },
    {
      key: 'ehad',
      label: 'Ehad & Education',
      forceRender: true,
      children: (
        <>
          <EhadDurationField
            fieldName="ehadDate"
            fieldLabel="Ehad Duration"
            required
            requiredMessage="Please specify the Ehad duration for the karkun."
            initialValue={dayjs()}
          />
          <InputTextField
            fieldName="referenceName"
            fieldLabel="R/O"
            required
            requiredMessage="Please input the reference name for the karkun."
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
        </>
      ),
    },
  ];

  return (
    <div className="visitor-form">
      <Form
        form={form}
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={handleFieldsChange}
      >
        <Space
          orientation="vertical"
          size={16}
          style={{ display: 'flex', width: '100%' }}
        >
          <Collapse
            className="visitor-form-sections"
            defaultActiveKey={['personal']}
            items={[personalItem]}
          />
          <Collapse
            className="visitor-form-sections"
            defaultActiveKey={['contact', 'ehad']}
            items={remainingItems}
          />
          <FormButtonsSaveCancel
            handleCancel={handleCancel}
            isFieldsTouched={isFieldsTouched}
            fullWidth
          />
        </Space>
      </Form>
    </div>
  );
};

export default NewForm;
