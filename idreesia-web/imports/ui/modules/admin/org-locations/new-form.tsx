import React, { useMemo } from 'react';
import { Form, Input, Select, type FormInstance } from 'antd';

import { CascaderField } from '/imports/ui/modules/helpers/fields';

import {
  OrgLocationTypes,
  type OrgLocationType,
} from 'meteor/idreesia-common/constants/organization';

import {
  ORG_LOCATION_TYPE_LABELS,
  buildParentCascaderOptions,
  getAllowedParentTypes,
  validateParentPath,
  type LocationRecord,
} from './org-location-types';

export interface NewLocationFormValues {
  type: OrgLocationType;
  name: string;
  /** The path from the top down to the parent; the last one is the parent. */
  parentPath: string[];
}

interface Props {
  form: FormInstance<NewLocationFormValues>;
  locations: LocationRecord[];
}

const layout = { labelCol: { span: 5 }, wrapperCol: { span: 17 } };

/**
 * The fields for creating a location, shown in a modal on the list, in the
 * same order as the edit page. The root can't be created here. The parent
 * options follow the chosen type, since each type only fits under certain
 * parents. The mehfil details are filled in later from the edit page. The
 * parent owns the form instance and the Save/Cancel buttons.
 */
const NewForm = ({ form, locations }: Props) => {
  const type = Form.useWatch('type', form);

  const byId = useMemo(
    () => new Map(locations.map(location => [location._id, location])),
    [locations]
  );

  const typeOptions = (
    Object.keys(ORG_LOCATION_TYPE_LABELS) as OrgLocationType[]
  )
    .filter(value => value !== OrgLocationTypes.ROOT)
    .map(value => ({ value, label: ORG_LOCATION_TYPE_LABELS[value] }));

  const parentOptions = useMemo(
    () => (type ? buildParentCascaderOptions(locations, type) : []),
    [type, locations]
  );

  // The parent options follow the type, so a new type clears a parent that
  // no longer fits.
  const handleTypeChange = (value: OrgLocationType) => {
    const path: string[] | undefined = form.getFieldValue('parentPath');
    const parent = path?.length ? byId.get(path[path.length - 1]) : undefined;
    if (parent && !getAllowedParentTypes(value).includes(parent.type)) {
      form.setFieldValue('parentPath', undefined);
    }
  };

  return (
    <Form form={form} layout="horizontal" style={{ width: '100%' }} {...layout}>
      <Form.Item
        name="type"
        label="Type"
        rules={[{ required: true, message: 'Please select a type.' }]}
      >
        <Select
          placeholder="Select a type"
          options={typeOptions}
          onChange={handleTypeChange}
        />
      </Form.Item>
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: 'Please input a name.' }]}
      >
        <Input />
      </Form.Item>
      <CascaderField
        data={parentOptions}
        fieldName="parentPath"
        fieldLabel="Parent"
        placeholder={type ? 'Select a parent location' : 'Select a type first'}
        disabled={!type}
        required
        requiredMessage="Please select a parent location."
        fieldLayout={layout}
        rules={[
          { validator: (_, path) => validateParentPath(type, byId, path) },
        ]}
      />
    </Form>
  );
};

export default NewForm;
