import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AutoComplete, Form } from 'antd';
import { get } from 'lodash';

import { Profiles } from '/imports/lib/collections/admin';

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
export default class ProfileField extends Component {
  static propTypes = {
    fieldName: PropTypes.string,
    fieldLabel: PropTypes.string,
    placeholder: PropTypes.string,
    fieldLayout: PropTypes.object,
    required: PropTypes.bool,
    requiredMessage: PropTypes.string,
    getFieldDecorator: PropTypes.func,
  };

  static defaultProps = {
    fieldLayout: formItemLayout,
  };

  getField() {
    const { fieldName, required, requiredMessage, placeholder, getFieldDecorator } = this.props;
    const children = [];
    const profiles = Profiles.find({}).fetch();

    profiles.forEach(profile => {
      children.push(
        <AutoComplete.Option key={profile._id} value={profile._id} text={profile.name}>
          {profile.name}
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

    return getFieldDecorator(fieldName, { rules })(
      <AutoComplete
        placeholder={placeholder}
        optionLabelProp="text"
        backfill
        filterOption={filterOption}
      >
        {children}
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
