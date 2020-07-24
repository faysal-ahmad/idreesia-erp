import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { TreeSelect, Form } from '/imports/ui/controls';

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
 * getFieldDecorator: Function from the Form component.
 * initialValue: Initial values to set in the form field.
 * handleValueChanged: Callback for whenever the selected value changes.
 */
export default class TreeMultiSelectField extends Component {
  static propTypes = {
    data: PropTypes.array,
    fieldName: PropTypes.string,
    fieldLabel: PropTypes.string,
    placeholder: PropTypes.string,
    fieldLayout: PropTypes.object,
    required: PropTypes.bool,
    requiredMessage: PropTypes.string,
    getFieldDecorator: PropTypes.func,
    initialValue: PropTypes.array,
    skipValue: PropTypes.string,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    initialValue: null,
    fieldLayout: formItemLayout,
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
        treeData={data}
        placeholder={placeholder}
        onChange={onChange}
        allowClear
        treeCheckable
        treeDefaultExpandAll
        showCheckedStrategy={TreeSelect.SHOW_PARENT}
        filterTreeNode={this.filterTreeNode}
      />
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
