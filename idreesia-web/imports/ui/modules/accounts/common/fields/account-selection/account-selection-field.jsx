import React, { Component } from "react";
import PropTypes from "prop-types";
import { filter } from "lodash";

import { TreeSelect, Form } from "antd";

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

export default class AccountSelectionField extends Component {
  static propTypes = {
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

  static defaultProps = {
    data: [],
    getDataValue: ({ number }) => number,
    getParentValue: ({ parent }) => parent,
    getDataText: ({ number, name }) => `[${number}] ${name}`,
    initialValue: null,
    showSearch: false,
    fieldLayout: formItemLayout,
  };

  getTreeNodes = (data, parent) => {
    const { skipValue, getDataValue, getParentValue, getDataText } = this.props;
    const filteredData = filter(data, node => {
      const parentId = getParentValue(node);
      return parentId === parent;
    });

    const treeNodes = [];
    filteredData.forEach(node => {
      const id = getDataValue(node);
      if (!skipValue || id !== skipValue) {
        const text = getDataText(node);
        const children = this.getTreeNodes(data, id);
        treeNodes.push(
          <TreeSelect.TreeNode value={id} title={text} key={id}>
            {children}
          </TreeSelect.TreeNode>
        );
      }
    });
    return treeNodes;
  };

  filterTreeNode = (_inputValue, treeNode) => {
    const title = treeNode.props.title.toLowerCase();
    const inputValue = _inputValue.toLowerCase();
    if (title.indexOf(inputValue) !== -1) return true;
    return false;
  };

  render() {
    const {
      data,
      initialValue,
      required,
      requiredMessage,
      fieldLabel,
      fieldLayout,
      fieldName,
      placeholder,
      onChange,
      showSearch,
    } = this.props;

    const treeNodes = this.getTreeNodes(data, 0);
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
          filterTreeNode={this.filterTreeNode}
          style={{ width: "100%" }}
        >
          {treeNodes}
        </TreeSelect>
      </Form.Item>
    );
  }
}
