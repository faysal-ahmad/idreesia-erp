import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AutoComplete, Form, Input, InputNumber } from 'antd';

import { ItemCategories } from '/imports/lib/collections/inventory';

class ItemForm extends Component {
  static propTypes = {
    form: PropTypes.object
  };

  getNameField() {
    const { getFieldDecorator } = this.props.form;
    const dataSource = [
      'A Some Text',
      'B Some Text',
      'C Some Text',
      'D Other Text',
      'E Other Text',
      'F Other Text'
    ];
    const rules = [
      {
        required: true,
        message: 'Please input a name for the item.'
      }
    ];
    return getFieldDecorator('name', { rules })(
      <AutoComplete dataSource={dataSource} placeholder="Item name" filterOption={true} />
    );
  }

  getIssuedField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please input a numeric value for issued.'
      }
    ];
    return getFieldDecorator('issued', { rules })(<InputNumber min={0} placeholder="0" />);
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 }
    };

    return (
      <Form layout="horizontal">
        <Form.Item label="Name" {...formItemLayout}>
          {this.getNameField()}
        </Form.Item>
        <Form.Item label="Issued" {...formItemLayout}>
          {this.getIssuedField()}
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create()(ItemForm);
