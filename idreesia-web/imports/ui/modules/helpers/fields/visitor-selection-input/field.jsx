import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form } from '/imports/ui/controls';
import Input from './input';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

export default class Field extends Component {
  static propTypes = {
    fieldName: PropTypes.string,
    fieldLabel: PropTypes.string,
    placeholder: PropTypes.string,
    fieldLayout: PropTypes.object,
    initialValue: PropTypes.object,
    required: PropTypes.bool,
    requiredMessage: PropTypes.string,
    disabled: PropTypes.bool,
    getFieldDecorator: PropTypes.func,

    portalId: PropTypes.string,
    showMsKarkunsList: PropTypes.bool,
    showOutstationKarkunsList: PropTypes.bool,
    showPortalKarkunsList: PropTypes.bool,
  };

  static defaultProps = {
    initialValue: null,
    fieldLayout: formItemLayout,
  };

  getField() {
    const {
      fieldName,
      placeholder,
      disabled,
      required,
      requiredMessage,
      getFieldDecorator,
      initialValue,
    } = this.props;

    const rules = [
      {
        required,
        message: requiredMessage,
      },
    ];

    return getFieldDecorator(fieldName, {
      initialValue,
      rules,
    })(<Input placeholder={placeholder} disabled={disabled} />);
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
