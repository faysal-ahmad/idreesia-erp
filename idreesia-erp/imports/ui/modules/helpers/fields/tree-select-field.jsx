import React, { Component } from "react";
import PropTypes from "prop-types";
import { TreeSelect, Form } from "antd";
import { filter } from "lodash";

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
 * getFieldDecorator: Function from the Form component.
 * initialValue: Initial values to set in the form field.
 * handleValueChanged: Callback for whenever the selected value changes.
 */
export default class TreeSelectField extends Component {
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
    requiredMessage: PropTypes.string,
    getFieldDecorator: PropTypes.func,
    initialValue: PropTypes.string,
    skipValue: PropTypes.string,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    getDataValue: ({ _id }) => _id,
    getParentValue: ({ parentId }) => parentId,
    getDataText: ({ name }) => name,
    initialValue: null,
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

  getField = () => {
    const {
      data,
      fieldName,
      required,
      requiredMessage,
      placeholder,
      getFieldDecorator,
      onChange,
      initialValue,
    } = this.props;

    const treeNodes = this.getTreeNodes(data, null);

    const rules = required
      ? [
          {
            required,
            message: requiredMessage,
          },
        ]
      : null;

    return getFieldDecorator(fieldName, { rules, initialValue })(
      <TreeSelect
        placeholder={placeholder}
        onChange={onChange}
        allowClear
        treeDefaultExpandAll
      >
        {treeNodes}
      </TreeSelect>
    );
  };

  render() {
    const { fieldLabel, fieldLayout } = this.props;
    return (
      <Form.Item label={fieldLabel} {...fieldLayout}>
        {this.getField()}
      </Form.Item>
    );
  }
}
