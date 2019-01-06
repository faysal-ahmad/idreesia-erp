import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select, Form } from 'antd';
import { get } from 'lodash';

import { PhysicalStores } from '/imports/lib/collections/inventory';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 }
};

/**
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
export default class ProfileField extends Component {
  static propTypes = {
    fieldName: PropTypes.string,
    fieldLabel: PropTypes.string,
    placeholder: PropTypes.string,
    fieldLayout: PropTypes.object,
    required: PropTypes.bool,
    requiredMessage: PropTypes.string,
    getFieldDecorator: PropTypes.func,
    initialValue: PropTypes.string,
    handleValueChanged: PropTypes.func
  };

  static defaultProps = {
    fieldLayout: formItemLayout
  };

  getField() {
    const {
      fieldName,
      required,
      requiredMessage,
      placeholder,
      getFieldDecorator,
      handleValueChanged,
      initialValue
    } = this.props;

    const options = [];
    const physicalStores = PhysicalStores.find({}).fetch();
    physicalStores.forEach(physicalStore => {
      options.push(
        <Select.Option key={physicalStore._id} value={physicalStore._id}>
          {physicalStore.name}
        </Select.Option>
      );
    });

    const rules = required
      ? [
          {
            required,
            message: requiredMessage
          }
        ]
      : null;

    return getFieldDecorator(fieldName, { rules, initialValue })(
      <Select placeholder={placeholder} onChange={handleValueChanged}>
        {options}
      </Select>
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
