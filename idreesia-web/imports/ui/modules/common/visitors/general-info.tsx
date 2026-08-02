import React, { useState, type ReactNode } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Alert,
  Badge,
  Collapse,
  Form,
  Space,
  Spin,
  type CollapseProps,
} from 'antd';

import {
  useDistinctCities,
  useDistinctCountries,
} from 'meteor/idreesia-common/hooks/security';
import type { SecurityRegistrationVisitorByIdQuery } from 'meteor/idreesia-common/types/client-operations';
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
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

type VisitorRecord = Partial<NonNullable<SecurityRegistrationVisitorByIdQuery['securityVisitorById']>>;

export interface VisitorGeneralInfoFormValues {
  name?: string;
  parentName?: string;
  cnicNumber?: string;
  contactNumber1?: string;
  contactNumber2?: string;
  city?: string;
  country?: string;
  currentAddress?: string;
  permanentAddress?: string;
  ehadDate?: Dayjs;
  birthDate?: Dayjs | null;
  referenceName?: string;
  educationalQualification?: string;
  meansOfEarning?: string;
  criminalRecord?: string;
  otherNotes?: string;
}

interface Props {
  visitor?: VisitorRecord;
  handleFinish(values: VisitorGeneralInfoFormValues): void | Promise<unknown>;
  handleCancel?(): void;
  showNotesSection?: boolean;
  showAuditInfo?: boolean;
  /** Non-collapsible content shown to the right of Personal Information */
  sideContent?: ReactNode;
}

const hasText = (value?: string | null) => Boolean(value && value.trim());

const GeneralInfo = ({
  visitor,
  handleFinish,
  handleCancel,
  showNotesSection = false,
  showAuditInfo = true,
  sideContent,
}: Props) => {
  const [form] = Form.useForm();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { distinctCities, distinctCitiesLoading } = useDistinctCities();
  const {
    distinctCountries,
    distinctCountriesLoading,
  } = useDistinctCountries();

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const _handleFinish = async (values: VisitorGeneralInfoFormValues) => {
    const { cnicNumber, contactNumber1 } = values;
    if (!cnicNumber && !contactNumber1) {
      form.setFields([
        { name: 'cnicNumber', errors: ['Please input the CNIC or Mobile Number for the person'] },
        { name: 'contactNumber1', errors: ['Please input the CNIC or Mobile Number for the person'] },
      ]);
      return;
    }

    await handleFinish(values);
    setIsFieldsTouched(false);
  };

  if (distinctCitiesLoading || distinctCountriesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const hasCriminalRecord = hasText(visitor?.criminalRecord);
  const hasOtherNotes = hasText(visitor?.otherNotes);

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
          requiredMessage="Please input the name for the person."
          initialValue={visitor?.name}
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          required
          requiredMessage="Please input the parent name for the person."
          initialValue={visitor?.parentName}
        />

        <AgeField
          fieldName="birthDate"
          fieldLabel="Age (years)"
          initialValue={
            visitor?.birthDate ? dayjs(Number(visitor.birthDate)) : null
          }
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={visitor?.cnicNumber}
        />
      </>
    ),
  };

  const remainingDefaultKeys = ['contact', 'ehad'];
  if (showNotesSection) {
    remainingDefaultKeys.push('notes');
  }

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
            initialValue={visitor?.contactNumber1}
          />

          <InputTextField
            fieldName="contactNumber2"
            fieldLabel="Home Number"
            initialValue={visitor?.contactNumber2}
          />

          <AutoCompleteField
            fieldName="city"
            fieldLabel="City"
            dataSource={distinctCities ?? []}
            required
            requiredMessage="Please input the city for the person."
            initialValue={visitor?.city}
          />

          <AutoCompleteField
            fieldName="country"
            fieldLabel="Country"
            dataSource={distinctCountries ?? []}
            required
            requiredMessage="Please input the country for the person."
            initialValue={visitor?.country}
          />

          <InputTextAreaField
            fieldName="currentAddress"
            fieldLabel="Current Address"
            required={false}
            initialValue={visitor?.currentAddress}
          />

          <InputTextAreaField
            fieldName="permanentAddress"
            fieldLabel="Permanent Address"
            required={false}
            initialValue={visitor?.permanentAddress}
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
            requiredMessage="Please specify the Ehad duration for the person."
            initialValue={
              visitor?.ehadDate != null && visitor.ehadDate !== ''
                ? dayjs(Number(visitor.ehadDate))
                : undefined
            }
          />

          <InputTextField
            fieldName="referenceName"
            fieldLabel="R/O"
            required
            requiredMessage="Please input the reference name for the person."
            initialValue={visitor?.referenceName}
          />

          <InputTextField
            fieldName="educationalQualification"
            fieldLabel="Education"
            initialValue={visitor?.educationalQualification}
            required={false}
          />

          <InputTextAreaField
            fieldName="meansOfEarning"
            fieldLabel="Means of Earning"
            initialValue={visitor?.meansOfEarning}
            required={false}
          />
        </>
      ),
    },
  ];

  if (showNotesSection) {
    remainingItems?.push({
      key: 'notes',
      label: (
        <span>
          Notes
          {hasCriminalRecord || hasOtherNotes ? (
            <Badge
              status={hasCriminalRecord ? 'error' : 'warning'}
              style={{ marginInlineStart: 8 }}
            />
          ) : null}
        </span>
      ),
      forceRender: true,
      children: (
        <>
          {hasCriminalRecord || hasOtherNotes ? (
            <Space
              direction="vertical"
              size={8}
              style={{ display: 'flex', marginBottom: 16 }}
            >
              {hasCriminalRecord ? (
                <Alert
                  type="error"
                  showIcon
                  message="Criminal record on file"
                  description="Review the criminal record notes below before allowing stay or access."
                />
              ) : null}
              {hasOtherNotes ? (
                <Alert
                  type="warning"
                  showIcon
                  message="Additional notes on file"
                  description="This visitor has other notes that may need attention."
                />
              ) : null}
            </Space>
          ) : null}

          <InputTextAreaField
            fieldName="criminalRecord"
            fieldLabel="Criminal Record"
            initialValue={visitor?.criminalRecord}
            required={false}
          />

          <InputTextAreaField
            fieldName="otherNotes"
            fieldLabel="Other Notes"
            initialValue={visitor?.otherNotes}
            required={false}
          />
        </>
      ),
    });
  }

  return (
    <div
      className={
        sideContent ? 'visitor-form-with-side' : 'visitor-form'
      }
    >
      <Form
        form={form}
        layout="horizontal"
        onFinish={_handleFinish}
        onFieldsChange={handleFieldsChange}
      >
        <Space direction="vertical" size={16} style={{ display: 'flex', width: '100%' }}>
          <div className={sideContent ? 'visitor-form-personal-row' : undefined}>
            <Collapse
              className="visitor-form-sections"
              defaultActiveKey={['personal']}
              items={[personalItem]}
            />
            {sideContent ? (
              <div className="visitor-form-side-panel">
                <div className="visitor-form-side-panel-body">{sideContent}</div>
              </div>
            ) : null}
          </div>

          <Collapse
            className="visitor-form-sections"
            defaultActiveKey={remainingDefaultKeys}
            items={remainingItems}
          />

          <FormButtonsSaveCancel
            handleCancel={handleCancel}
            isFieldsTouched={isFieldsTouched}
            fullWidth
          />
        </Space>
      </Form>
      {showAuditInfo ? <AuditInfo record={visitor ?? {}} /> : null}
    </div>
  );
};

export default GeneralInfo;
