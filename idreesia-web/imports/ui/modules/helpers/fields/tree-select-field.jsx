import React from 'react';
import PropTypes from 'prop-types';

import { filter } from 'meteor/idreesia-common/utilities/lodash';
import { TreeSelect, Form } from 'antd';

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
const TreeSelectField = ({
  data = [],
  getDataValue = ({ _id }) => _id,
  getParentValue = ({ parentId }) => parentId,
  getDataText = ({ name }) => name,
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
}) => {
  const getTreeNodes = (_data, parent) => {
    const filteredData = filter(_data, node => {
      const parentId = getParentValue(node);
      return parentId === parent;
    });

    const treeNodes = [];
    filteredData.forEach(node => {
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

  const filterTreeNode = (_inputValue, treeNode) => {
    const title = treeNode.props.title.toLowerCase();
    const inputValue = _inputValue.toLowerCase();
    if (title.indexOf(inputValue) !== -1) return true;
    return false;
  };

  const treeNodes = getTreeNodes(data, null);
  const rules = required
    ? [
        {
          required,
          message: requiredMessage,
        },
      ]
    : null;

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

TreeSelectField.propTypes = {
  data: PropTypes.array,
  getDataValue: PropTypes.func,
  getParentValue: PropTypes.func,
  getDataText: PropTypes.func,
  fieldName: PropTypes.string,
  fieldLabel: PropTypes.string,
  placeholder: PropTypes.string,
  fieldLayout: PropTypes.object,
  required: PropTypes.bool,
  showSearch: PropTypes.bool,
  requiredMessage: PropTypes.string,
  initialValue: PropTypes.string,
  skipValue: PropTypes.string,
  onChange: PropTypes.func,
};

export default TreeSelectField;