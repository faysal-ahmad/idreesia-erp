import React from 'react';
import PropTypes from 'prop-types';

import { TreeSelect, Form } from 'antd';

const AntFormItem = (Form as any).Item;
const AntTreeSelect = TreeSelect as any;
interface FieldProps { data?: unknown[]; fieldName: string; fieldLabel?: string; placeholder?: string; fieldLayout?: Record<string, unknown>; required?: boolean; requiredMessage?: string; initialValue?: unknown[] | null; onChange?(value: unknown): void; }

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

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
  const filterTreeNode = (inputValue: string, treeNode: any) => {
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
  : null;

  return (
    <AntFormItem name={fieldName} label={fieldLabel} initialValue={initialValue} rules={rules} {...fieldLayout}>
      <AntTreeSelect
        treeData={data}
        placeholder={placeholder}
        onChange={onChange}
        allowClear
        treeCheckable
        treeDefaultExpandAll
        showCheckedStrategy={AntTreeSelect.SHOW_PARENT}
        filterTreeNode={filterTreeNode}
      />
    </AntFormItem>
  );
}

TreeMultiSelectField.propTypes = {
  data: PropTypes.array,
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  required: PropTypes.bool,
  requiredMessage: PropTypes.string,
  initialValue: PropTypes.array,
  onChange: PropTypes.func,
};

export default TreeMultiSelectField;