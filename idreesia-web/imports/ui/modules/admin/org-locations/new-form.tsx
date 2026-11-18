import React, { useMemo } from 'react';
import { Form, Input, Select, type FormInstance } from 'antd';

import {
  OrgLocationTypes,
  type OrgLocationType,
} from 'meteor/idreesia-common/constants/organization';

import {
  ORG_LOCATION_TYPE_LABELS,
  getAllowedParentTypes,
  getLocationPath,
  type LocationRecord,
} from './org-location-types';

export interface NewLocationFormValues {
  type: OrgLocationType;
  name: string;
  parentId: string;
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

  const parentOptions = useMemo(() => {
    if (!type) return [];
    const allowed = getAllowedParentTypes(type);
    return locations
      .filter(location => allowed.includes(location.type))
      .map(location => ({
        value: location._id,
        label: getLocationPath(location, byId),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [type, locations, byId]);

  // The parent options follow the type, so a new type clears a parent that
  // no longer fits.
  const handleTypeChange = (value: OrgLocationType) => {
    const parentId = form.getFieldValue('parentId');
    const parent = parentId ? byId.get(parentId) : undefined;
    if (parent && !getAllowedParentTypes(value).includes(parent.type)) {
      form.setFieldValue('parentId', undefined);
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
      <Form.Item
        name="parentId"
        label="Parent"
        rules={[{ required: true, message: 'Please select a parent location.' }]}
      >
        <Select
          showSearch
          optionFilterProp="label"
          placeholder={type ? 'Select a parent location' : 'Select a type first'}
          disabled={!type}
          options={parentOptions}
        />
      </Form.Item>
    </Form>
  );
};

export default NewForm;
