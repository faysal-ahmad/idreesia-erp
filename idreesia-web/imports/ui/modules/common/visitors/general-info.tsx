import React, { useState, type ReactNode } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useQuery } from '@apollo/client/react';
import {
  Alert,
  Badge,
  Collapse,
  Form,
  Space,
  Spin,
  type CollapseProps,
} from 'antd';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import {
  useDistinctCities,
  useDistinctCountries,
} from 'meteor/idreesia-common/hooks/security';
import type { SecurityRegistrationPersonByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { ALL_PEOPLE_TAGS } from '/imports/ui/modules/admin/people-tags/gql';
import {
  AgeField,
  AutoCompleteField,
  EhadDurationField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  InputTextAreaField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

type VisitorRecord = Partial<NonNullable<SecurityRegistrationPersonByIdQuery['securityPersonById']>>;

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
  tagIds?: string[];
}

interface Props {
  visitor?: VisitorRecord;
  handleFinish(values: VisitorGeneralInfoFormValues): void | Promise<unknown>;
  handleCancel?(): void;
  showAdditionalInfoSection?: boolean;
  showAuditInfo?: boolean;
  /** Non-collapsible content shown to the right of Personal Information */
  sideContent?: ReactNode;
}

const hasText = (value?: string | null) => Boolean(value && value.trim());

const GeneralInfo = ({
  visitor,
  handleFinish,
  handleCancel,
  showAdditionalInfoSection = false,
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
  const { data: peopleTagsData } = useQuery(ALL_PEOPLE_TAGS);

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const allTags = peopleTagsData?.allPeopleTags ?? [];
  const securityScopedTags = allTags.filter(
    (tag): tag is NonNullable<typeof tag> =>
      tag != null && (tag.moduleNames ?? []).includes(ModuleNames.security)
  );
  const existingTagIds = (visitor?.sharedData?.tagIds ?? []).filter(
    (tagId): tagId is string => tagId != null
  );
  const nonSecurityTagIds = existingTagIds.filter(
    (tagId) => !securityScopedTags.some((tag) => tag._id === tagId)
  );

  const _handleFinish = async (values: VisitorGeneralInfoFormValues) => {
    const { cnicNumber, contactNumber1 } = values;
    if (!cnicNumber && !contactNumber1) {
      form.setFields([
        { name: 'cnicNumber', errors: ['Please input the CNIC or Mobile Number for the person'] },
        { name: 'contactNumber1', errors: ['Please input the CNIC or Mobile Number for the person'] },
      ]);
      return;
    }

    await handleFinish({
      ...values,
      tagIds: [...nonSecurityTagIds, ...(values.tagIds ?? [])],
    });
    setIsFieldsTouched(false);
  };

  if (distinctCitiesLoading || distinctCountriesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const hasCriminalRecord = hasText(visitor?.visitorData?.criminalRecord);
  const hasOtherNotes = hasText(visitor?.visitorData?.otherNotes);

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
          initialValue={visitor?.sharedData?.name}
        />

        <InputTextField
          fieldName="parentName"
          fieldLabel="S/O"
          required
          requiredMessage="Please input the parent name for the person."
          initialValue={visitor?.sharedData?.parentName}
        />

        <AgeField
          fieldName="birthDate"
          fieldLabel="Age (years)"
          initialValue={
            visitor?.sharedData?.birthDate ? dayjs(Number(visitor.sharedData?.birthDate)) : null
          }
        />

        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={visitor?.sharedData?.cnicNumber}
        />
      </>
    ),
  };

  const remainingDefaultKeys = ['contact', 'ehad'];
  if (showAdditionalInfoSection) {
    remainingDefaultKeys.push('additionalInfo');
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
            initialValue={visitor?.sharedData?.contactNumber1}
          />

          <InputTextField
            fieldName="contactNumber2"
            fieldLabel="Home Number"
            initialValue={visitor?.sharedData?.contactNumber2}
          />

          <AutoCompleteField
            fieldName="city"
            fieldLabel="City"
            options={distinctCities ?? []}
            required
            requiredMessage="Please input the city for the person."
            initialValue={visitor?.visitorData?.city}
          />

          <AutoCompleteField
            fieldName="country"
            fieldLabel="Country"
            options={distinctCountries ?? []}
            required
            requiredMessage="Please input the country for the person."
            initialValue={visitor?.visitorData?.country}
          />

          <InputTextAreaField
            fieldName="currentAddress"
            fieldLabel="Current Address"
            required={false}
            initialValue={visitor?.sharedData?.currentAddress}
          />

          <InputTextAreaField
            fieldName="permanentAddress"
            fieldLabel="Permanent Address"
            required={false}
            initialValue={visitor?.sharedData?.permanentAddress}
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
              visitor?.sharedData?.ehadDate != null && visitor.sharedData?.ehadDate !== ''
                ? dayjs(Number(visitor.sharedData?.ehadDate))
                : undefined
            }
          />

          <InputTextField
            fieldName="referenceName"
            fieldLabel="R/O"
            required
            requiredMessage="Please input the reference name for the person."
            initialValue={visitor?.sharedData?.referenceName}
          />

          <InputTextField
            fieldName="educationalQualification"
            fieldLabel="Education"
            initialValue={visitor?.sharedData?.educationalQualification}
            required={false}
          />

          <InputTextAreaField
            fieldName="meansOfEarning"
            fieldLabel="Means of Earning"
            initialValue={visitor?.sharedData?.meansOfEarning}
            required={false}
          />
        </>
      ),
    },
  ];

  if (showAdditionalInfoSection) {
    remainingItems?.push({
      key: 'additionalInfo',
      label: (
        <span>
          Additional Information
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
              orientation="vertical"
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

          <SelectField
            data={securityScopedTags}
            getDataValue={(tag) => tag._id as string}
            getDataText={(tag) => tag.name}
            fieldName="tagIds"
            fieldLabel="Tags"
            mode="multiple"
            initialValue={existingTagIds.filter((tagId) =>
              securityScopedTags.some((tag) => tag._id === tagId)
            )}
            required={false}
          />

          <InputTextAreaField
            fieldName="criminalRecord"
            fieldLabel="Criminal Record"
            initialValue={visitor?.visitorData?.criminalRecord}
            required={false}
          />

          <InputTextAreaField
            fieldName="otherNotes"
            fieldLabel="Other Notes"
            initialValue={visitor?.visitorData?.otherNotes}
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
        <Space orientation="vertical" size={16} style={{ display: 'flex', width: '100%' }}>
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
