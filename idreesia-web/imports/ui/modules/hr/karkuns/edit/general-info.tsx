import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation } from '@apollo/client/react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Collapse,
  Form,
  Space,
  Spin,
  type CollapseProps,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  useAllCities,
  useAllCityMehfils,
} from 'meteor/idreesia-common/hooks/common';
import type { HrKarkunByIdForKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  AgeField,
  CascaderField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  InputTextAreaField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
import { getCityMehfilCascaderData } from '/imports/ui/modules/common/utilities';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import Picture from './picture';
import { UPDATE_HR_KARKUN } from '../gql';

type Karkun = NonNullable<HrKarkunByIdForKarkunsQuery['hrKarkunById']>;

interface LabelValue {
  label: string;
  value: string;
}

export interface KarkunGeneralInfoFormValues {
  name?: string;
  parentName?: string;
  cnicNumber?: string;
  contactNumber1?: string;
  contactNumber2?: string;
  emailAddress?: string;
  currentAddress?: string;
  permanentAddress?: string;
  cityIdMehfilId?: Array<string | undefined>;
  bloodGroup?: string;
  educationalQualification?: string;
  meansOfEarning?: string;
  ehadDate?: Dayjs;
  ehadKarkun?: boolean;
  ehadPermissionDate?: Dayjs | null;
  birthDate?: Dayjs | null;
  deathDate?: Dayjs | null;
  referenceName?: string;
}

interface Props {
  history: History;
  karkunId: string;
  karkun: Karkun;
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

const GeneralInfo = ({ history, karkunId, karkun }: Props) => {
  const [form] = Form.useForm();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { allCities, allCitiesLoading } = useAllCities();
  const { allCityMehfils, allCityMehfilsLoading } = useAllCityMehfils();
  const [updateHrKarkun] = useMutation(UPDATE_HR_KARKUN, {
    refetchQueries: ['pagedHrKarkuns', 'hrKarkunByIdForKarkuns'],
  });

  const handleCancel = () => {
    history.push(paths.karkunsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = async (values: KarkunGeneralInfoFormValues) => {
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
      await updateHrKarkun({
        variables: {
          _id: karkunId,
          name: values.name ?? '',
          parentName: values.parentName,
          cnicNumber: values.cnicNumber,
          contactNumber1: values.contactNumber1,
          contactNumber2: values.contactNumber2,
          emailAddress: values.emailAddress,
          currentAddress: values.currentAddress,
          permanentAddress: values.permanentAddress,
          cityId: values.cityIdMehfilId?.[0],
          cityMehfilId: values.cityIdMehfilId?.[1],
          bloodGroup: values.bloodGroup || null,
          educationalQualification: values.educationalQualification,
          meansOfEarning: values.meansOfEarning,
          ehadDate: values.ehadDate as unknown as string | null | undefined,
          birthDate: values.birthDate as unknown as string | null | undefined,
          deathDate: values.deathDate as unknown as string | null | undefined,
          referenceName: values.referenceName,
        },
      });
      message.success('Karkun updated', 2);
      setIsFieldsTouched(false);
    } catch (error) {
      message.error((error as Error).message, 5);
      throw error;
    }
  };

  if (allCitiesLoading || allCityMehfilsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const cities = allCities ?? [];
  const cityMehfils = allCityMehfils ?? [];

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
          initialValue={karkun.sharedData?.name}
        />
        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          required
          requiredMessage="Please input the parent name for the karkun."
          initialValue={karkun.sharedData?.parentName}
        />
        <AgeField
          fieldName="birthDate"
          fieldLabel="Age (years)"
          initialValue={
            karkun.sharedData?.birthDate
              ? dayjs(Number(karkun.sharedData.birthDate))
              : null
          }
        />
        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={karkun.sharedData?.cnicNumber || ''}
        />
        <SelectField<LabelValue>
          fieldName="bloodGroup"
          fieldLabel="Blood Group"
          required={false}
          data={BLOOD_GROUP_OPTIONS}
          getDataValue={({ value }) => value}
          getDataText={({ label }) => label}
          initialValue={karkun.sharedData?.bloodGroup}
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
            initialValue={karkun.sharedData?.contactNumber1 || ''}
          />
          <InputTextField
            fieldName="contactNumber2"
            fieldLabel="Home Number"
            initialValue={karkun.sharedData?.contactNumber2}
            required={false}
          />
          <InputTextField
            fieldName="emailAddress"
            fieldLabel="Email"
            initialValue={karkun.sharedData?.emailAddress}
            required={false}
          />
          <CascaderField
            data={getCityMehfilCascaderData(cities, cityMehfils) ?? []}
            fieldName="cityIdMehfilId"
            fieldLabel="City/Mehfil"
            initialValue={[
              karkun.karkunData?.cityId,
              karkun.karkunData?.cityMehfilId,
            ]}
            required
            requiredMessage="Please select a city/mehfil from the list."
          />
          <InputTextAreaField
            fieldName="currentAddress"
            fieldLabel="Current Address"
            initialValue={karkun.sharedData?.currentAddress}
            required={false}
          />
          <InputTextAreaField
            fieldName="permanentAddress"
            fieldLabel="Permanent Address"
            initialValue={karkun.sharedData?.permanentAddress}
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
            initialValue={
              karkun.sharedData?.ehadDate != null &&
              karkun.sharedData.ehadDate !== ''
                ? dayjs(Number(karkun.sharedData.ehadDate))
                : dayjs()
            }
          />
          <InputTextField
            fieldName="referenceName"
            fieldLabel="R/O"
            required
            requiredMessage="Please input the reference name for the karkun."
            initialValue={karkun.sharedData?.referenceName}
          />
          <InputTextField
            fieldName="educationalQualification"
            fieldLabel="Education"
            initialValue={karkun.sharedData?.educationalQualification}
            required={false}
          />
          <InputTextAreaField
            fieldName="meansOfEarning"
            fieldLabel="Means of Earning"
            initialValue={karkun.sharedData?.meansOfEarning}
            required={false}
          />
        </>
      ),
    },
  ];

  return (
    <div className="visitor-form-with-side">
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
          <div className="visitor-form-personal-row">
            <Collapse
              className="visitor-form-sections"
              defaultActiveKey={['personal']}
              items={[personalItem]}
            />
            <div className="visitor-form-side-panel">
              <div className="visitor-form-side-panel-body">
                <Picture karkunId={karkunId} karkun={karkun} />
              </div>
            </div>
          </div>

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
      <AuditInfo record={karkun} />
    </div>
  );
};

export default GeneralInfo;
