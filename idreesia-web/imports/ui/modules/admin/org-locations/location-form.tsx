import React, { useMemo } from 'react';
import { Form } from 'antd';

import {
  OrgLocationTypes,
  type OrgLocationType,
} from 'meteor/idreesia-common/constants/organization';
import {
  CheckboxField,
  InputTextAreaField,
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

import {
  ORG_LOCATION_TYPE_LABELS,
  getAllowedParentTypes,
  getLocationPath,
  type LocationRecord,
} from './org-location-types';

export const MehfilDetailsFields = () => (
  <>
    <InputTextAreaField fieldName="address" fieldLabel="Address" />
    <InputTextField fieldName="mehfilStartYear" fieldLabel="Start Year" />
    <InputTextAreaField fieldName="timingDetails" fieldLabel="Timing Details" />
    <CheckboxField fieldName="lcdAvailability" fieldLabel="LCD Available" />
    <CheckboxField fieldName="tabAvailability" fieldLabel="Tab Available" />
    <InputTextAreaField
      fieldName="otherMehfilDetails"
      fieldLabel="Other Details"
    />
  </>
);

export interface LocationFormValues {
  name: string;
  type: OrgLocationType;
  parentId?: string | null;
  address?: string;
  mehfilStartYear?: string;
  timingDetails?: string;
  lcdAvailability?: boolean;
  tabAvailability?: boolean;
  otherMehfilDetails?: string;
}

interface Props {
  locations: LocationRecord[];
  /** Set when editing: the type is then fixed and the location's own subtree is not a valid parent. */
  editingId?: string;
  fixedType?: OrgLocationType;
  initialValues?: Partial<LocationFormValues>;
  /** Hides the mehfil-only fields (the edit page shows them in their own tab). */
  hideMehfilFields?: boolean;
  onFieldsChange?(): void;
  onFinish(values: LocationFormValues): void;
  children?: React.ReactNode;
}

const LocationForm = ({
  locations,
  editingId,
  fixedType,
  initialValues,
  hideMehfilFields = false,
  onFieldsChange,
  onFinish,
  children,
}: Props) => {
  const [form] = Form.useForm<LocationFormValues>();
  const selectedType: OrgLocationType | undefined =
    Form.useWatch('type', form) ?? fixedType ?? initialValues?.type;

  const byId = useMemo(
    () => new Map(locations.map(location => [location._id, location])),
    [locations]
  );
  const hasRoot = locations.some(l => l.type === OrgLocationTypes.ROOT);

  const typeOptions = (
    Object.keys(ORG_LOCATION_TYPE_LABELS) as OrgLocationType[]
  )
    .filter(type => type !== OrgLocationTypes.ROOT || !hasRoot)
    .map(type => ({ type, label: ORG_LOCATION_TYPE_LABELS[type] }));

  const parentOptions = useMemo(() => {
    if (!selectedType) return [];
    const allowed = getAllowedParentTypes(selectedType);
    return locations
      .filter(l => allowed.includes(l.type))
      .filter(
        l =>
          !editingId ||
          (l._id !== editingId && !l.allParentIds.includes(editingId))
      )
      .map(l => ({ _id: l._id, name: getLocationPath(l, byId) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedType, locations, editingId, byId]);

  const handleFinish = (values: LocationFormValues) =>
    onFinish({ ...values, type: (fixedType ?? values.type) as OrgLocationType });

  return (
    <Form
      form={form}
      layout="horizontal"
      initialValues={initialValues}
      onFinish={handleFinish}
      onFieldsChange={onFieldsChange}
    >
      <SelectField
        data={typeOptions}
        getDataValue={({ type }) => type}
        getDataText={({ label }) => label}
        fieldName="type"
        fieldLabel="Type"
        allowClear={false}
        disabled={!!fixedType}
        initialValue={fixedType ?? initialValues?.type ?? null}
        required
        requiredMessage="Please select a type."
      />
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name."
      />
      {selectedType && selectedType !== OrgLocationTypes.ROOT ? (
        <SelectField
          data={parentOptions}
          fieldName="parentId"
          fieldLabel="Parent"
          allowClear={false}
          // Read-only when editing: a location is moved by dragging it on the list.
          disabled={!!editingId}
          initialValue={initialValues?.parentId ?? null}
          required
          requiredMessage="Please select a parent location."
        />
      ) : null}
      {selectedType === OrgLocationTypes.MEHFIL && !hideMehfilFields ? (
        <MehfilDetailsFields />
      ) : null}
      {children}
    </Form>
  );
};

export default LocationForm;
