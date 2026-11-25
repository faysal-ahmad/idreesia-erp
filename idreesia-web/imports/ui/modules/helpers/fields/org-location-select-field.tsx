import React, { useMemo } from 'react';
import { Form, Tag, TreeSelect } from 'antd';
import type { TreeSelectProps } from 'antd';

import {
  OrgLocationTypes,
  type OrgLocationType,
} from 'meteor/idreesia-common/constants/organization';
import {
  ORG_LOCATION_TYPE_COLORS,
  ORG_LOCATION_TYPE_LABELS,
} from '/imports/ui/modules/admin/org-locations/org-location-types';

export interface OrgLocationItem {
  _id?: string | null;
  name?: string | null;
  type?: string | null;
  parentId?: string | null;
}

interface FieldProps {
  /** The flat list of org locations; the tree is built from parentId. */
  locations?: OrgLocationItem[];
  fieldName: string;
  fieldLabel?: string;
  placeholder?: string;
  fieldLayout?: Record<string, unknown>;
  initialValue?: string | null;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

type TreeNode = NonNullable<TreeSelectProps['treeData']>[number];

const isSelectable = (type?: string | null) =>
  type === OrgLocationTypes.CITY || type === OrgLocationTypes.MEHFIL;

// Builds the whole org location tree. Only city and mehfil locations can be
// picked; the other levels are there to find them by.
export const buildOrgLocationTree = (locations: OrgLocationItem[]): TreeNode[] => {
  const childrenByParent = new Map<string | null, OrgLocationItem[]>();
  locations.forEach(location => {
    if (!location._id) return;
    const key = location.parentId ?? null;
    childrenByParent.set(key, [...(childrenByParent.get(key) ?? []), location]);
  });

  const build = (parentId: string | null): TreeNode[] =>
    (childrenByParent.get(parentId) ?? []).map(location => ({
      value: location._id as string,
      // The plain name is what is searched and shown once selected.
      name: location.name ?? '',
      title: (
        <span
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>{location.name}</span>
          {location.type && location.type in ORG_LOCATION_TYPE_LABELS ? (
            <Tag
              color={ORG_LOCATION_TYPE_COLORS[location.type as OrgLocationType]}
              style={{ marginInlineEnd: 0 }}
            >
              {ORG_LOCATION_TYPE_LABELS[location.type as OrgLocationType]}
            </Tag>
          ) : null}
        </span>
      ),
      selectable: isSelectable(location.type),
      children: build(location._id as string),
    }));

  return build(null);
};

/**
 * A single select over the org location tree that narrows down as the user
 * types. Only city and mehfil locations are selectable.
 */
const OrgLocationSelectField = ({
  locations = [],
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  initialValue = null,
}: FieldProps) => {
  const treeData = useMemo(() => buildOrgLocationTree(locations), [locations]);

  return (
    <Form.Item
      name={fieldName}
      label={fieldLabel}
      initialValue={initialValue}
      {...fieldLayout}
    >
      <TreeSelect
        treeData={treeData}
        placeholder={placeholder}
        allowClear
        showSearch
        treeNodeFilterProp="name"
        treeNodeLabelProp="name"
        popupMatchSelectWidth={480}
      />
    </Form.Item>
  );
};

export default OrgLocationSelectField;
