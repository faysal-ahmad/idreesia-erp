import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AutoComplete, Form } from 'antd';
import { get } from 'lodash';

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
    data: PropTypes.array,
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
    optionRenderer: PropTypes.func,
  };

  static defaultProps = {
    data: [],
    getDataValue: ({ _id }) => _id,
    getDataText: ({ name }) => name,
    initialValue: null,
    fieldLayout: formItemLayout,
    optionRenderer: text => text,
  };

  getField() {
    const {
      data,
      getDataValue,
      getDataText,
      fieldName,
      required,
      requiredMessage,
      placeholder,
      getFieldDecorator,
      initialValue,
      optionRenderer,
    } = this.props;

    const options = [];
    data.forEach(dataObj => {
      const value = getDataValue(dataObj);
      const text = getDataText(dataObj);
      options.push(
        <AutoComplete.Option key={value} value={value} text={text}>
          {optionRenderer(text, dataObj)}
        </AutoComplete.Option>
      );
    });

    const rules = required
      ? [
          {
            required,
            message: requiredMessage,
          },
        ]
      : null;

    const filterOption = (inputValue, option) => {
      const optionText = get(option, ['props', 'text'], '');
      return optionText.indexOf(inputValue) !== -1;
    };

    return getFieldDecorator(fieldName, { initialValue, rules })(
      <AutoComplete
        placeholder={placeholder}
        optionLabelProp="text"
        backfill
        filterOption={filterOption}
      >
        {options}
      </AutoComplete>
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
