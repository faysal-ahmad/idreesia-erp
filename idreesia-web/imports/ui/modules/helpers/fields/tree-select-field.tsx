import React from 'react';

import { filter } from 'meteor/idreesia-common/utilities/lodash';
import { TreeSelect, Form } from 'antd';
import type { TreeSelectProps } from 'antd';

type DataNode = NonNullable<TreeSelectProps['treeData']>[number];

type DefaultRecord = {
  _id?: string | number | null;
  parentId?: string | number | null;
  name?: React.ReactNode | null;
};
type FieldValue = string | number;

interface FieldProps<T> {
  data?: T[];
  getDataValue?(data: T): FieldValue;
  getParentValue?(data: T): FieldValue | null;
  getDataText?(data: T): React.ReactNode;
  fieldName: string;
  fieldLabel?: string;
  placeholder?: string;
  fieldLayout?: Record<string, unknown>;
  required?: boolean;
  showSearch?: boolean;
  requiredMessage?: string;
  initialValue?: string | null;
  skipValue?: FieldValue;
  onChange?(value: unknown): void;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};


/**
 * data: Array of objects (containing text and value)
 * getDataValue: Function that returns the "value" from the above data object
 * getDataText: Function that returns the "text" from the above data object
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * placeholder: Placeholder text to show in the form field.
 * fieldLayout: Layout settings for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 * initialValue: Initial values to set in the form field.
 * handleValueChanged: Callback for whenever the selected value changes.
 */
function TreeSelectField<T = DefaultRecord>({
  data = [],
  getDataValue = (item: T) => (item as DefaultRecord)._id as FieldValue,
  getParentValue = (item: T) => (item as DefaultRecord).parentId ?? null,
  getDataText = (item: T) => (item as DefaultRecord).name,
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  required,
  showSearch = false,
  requiredMessage,
  initialValue = null,
  skipValue,
  onChange,
}: FieldProps<T>) {
  const getTreeNodes = (_data: T[], parent: FieldValue | null): React.ReactNode[] => {
    const filteredData = filter(_data, (node: T) => {
      const parentId = getParentValue(node);
      return parentId === parent;
    });

    const treeNodes: React.ReactNode[] = [];
    filteredData.forEach((node: T) => {
      const id = getDataValue(node);
      if (!skipValue || id !== skipValue) {
        const text = getDataText(node);
        const children = getTreeNodes(_data, id);
        treeNodes.push(
          <TreeSelect.TreeNode value={id} title={text} key={id}>
            {children}
          </TreeSelect.TreeNode>
        );
      }
    });
    return treeNodes;
  };

  const filterTreeNode = (inputValue: string, treeNode: DataNode) => {
    const node = treeNode as DataNode & { props?: { title?: React.ReactNode } };
    const title = String(node.props?.title ?? node.title ?? '').toLowerCase();
    return title.includes(inputValue.toLowerCase());
  };

  const treeNodes = getTreeNodes(data, null);
  const rules = required
    ? [
        {
          required,
          message: requiredMessage,
        },
      ]
    : undefined;

  return (
    <Form.Item name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <TreeSelect
        placeholder={placeholder}
        onChange={onChange}
        allowClear
        showSearch={showSearch}
        treeDefaultExpandAll
        filterTreeNode={filterTreeNode}
      >
        {treeNodes}
      </TreeSelect>
    </Form.Item>
  );
}

export default TreeSelectField;
