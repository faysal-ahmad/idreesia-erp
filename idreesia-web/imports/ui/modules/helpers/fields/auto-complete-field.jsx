import React, { Component } from "react";
import PropTypes from "prop-types";

import { AutoComplete, Form } from "/imports/ui/controls";

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

/**
 * fieldName: Name of the property in which the form field value would be saved.
 * fieldLabel: Label to display before the form field.
 * placeholder: Placeholder text to show in the form field.
 * fieldLayout: Layout settings for the form field.
 * required: Whether a value is required for this field.
 * requiredMessage: Message to show if the value is not entered.
 */
export default class AutoCompleteField extends Component {
  static propTypes = {
    dataSource: PropTypes.array,
    getDataValue: PropTypes.func,
    getDataText: PropTypes.func,
    fieldName: PropTypes.string,
    fieldLabel: PropTypes.string,
    placeholder: PropTypes.string,
    fieldLayout: PropTypes.object,
    required: PropTypes.bool,
    requiredMessage: PropTypes.string,
    getFieldDecorator: PropTypes.func,
    initialValue: PropTypes.string,
    filterOption: PropTypes.func,
  };

  static defaultProps = {
    dataSource: [],
    initialValue: null,
    fieldLayout: formItemLayout,
    filterOption: (_inputValue, option) => {
      const key = option.key.toLowerCase();
      const inputValue = _inputValue.toLowerCase();
      if (key.startsWith(inputValue)) return true;
      return false;
    },
  };

  getField() {
    const {
      dataSource,
      fieldName,
      required,
      requiredMessage,
      placeholder,
      getFieldDecorator,
      initialValue,
      filterOption,
    } = this.props;

    const rules = required
      ? [
          {
            required,
            message: requiredMessage,
          },
        ]
      : null;

    return getFieldDecorator(fieldName, { initialValue, rules })(
      <AutoComplete
        placeholder={placeholder}
        dataSource={dataSource}
        backfill
        filterOption={filterOption}
      />
    );
  }

  render() {
    const { fieldLabel, fieldLayout } = this.props;
    return (
      <Form.Item label={fieldLabel} {...fieldLayout}>
        {this.getField()}
      </Form.Item>
    );
  }
}
