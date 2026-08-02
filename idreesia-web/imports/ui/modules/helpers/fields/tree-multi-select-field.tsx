import React from 'react';

import { TreeSelect, Form } from 'antd';

interface TreeNode {
  title?: React.ReactNode;
  value?: string | number;
  children?: TreeNode[];
}

interface FieldProps {
  data?: TreeNode[];
  fieldName: string;
  fieldLabel?: string;
  placeholder?: string;
  fieldLayout?: Record<string, unknown>;
  required?: boolean;
  requiredMessage?: string;
  initialValue?: unknown[] | null;
  onChange?(value: unknown): void;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

interface FilterTreeNode {
  title?: React.ReactNode;
  props?: {
    title?: React.ReactNode;
  };
}

/**
 * data: Array of objects (containing text and value)
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * placeholder: Placeholder text to show in the form field.
 * fieldLayout: Layout settings for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 * initialValue: Initial values to set in the form field.
 * handleValueChanged: Callback for whenever the selected value changes.
 */
const TreeMultiSelectField = ({
  data = [],
  fieldName,
  fieldLabel,
  placeholder,
  fieldLayout = formItemLayout,
  required,
  requiredMessage,
  initialValue = null,
  onChange,
}: FieldProps) => {
  const filterTreeNode = (inputValue: string, treeNode: FilterTreeNode) => {
    const title = String(treeNode?.title ?? treeNode?.props?.title ?? '').toLowerCase();
    return title.includes(inputValue.toLowerCase());
  };

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
        treeData={data}
        placeholder={placeholder}
        onChange={onChange}
        allowClear
        treeCheckable
        treeDefaultExpandAll
        showCheckedStrategy={TreeSelect.SHOW_PARENT}
        filterTreeNode={filterTreeNode}
      />
    </Form.Item>
  );
};

export default TreeMultiSelectField;
