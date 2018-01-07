import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Row } from 'antd';

import { PhysicalStores } from '/imports/lib/collections/inventory';

class NewForm extends React.Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.physicalStoresNewFormPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const doc = {
        name: fieldsValue.name,
        address: fieldsValue.address
      };

      Meteor.call('inventory/physicalStores.create', { doc }, (error, result) => {
        debugger;
        if (error) return;
      });
    });
  };

  getNameField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please input a name for the physical store.'
      }
    ];
    return getFieldDecorator('name', { rules })(<Input placeholder="Physical store name" />);
  }

  getAddressField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [];
    return getFieldDecorator('address', { rules })(
      <Input.TextArea rows={5} placeholder="Physical store address" />
    );
  }

  render() {
    const props = this.props;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 }
    };

    const buttonItemLayout = {
      wrapperCol: { span: 14, offset: 4 }
    };

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <Form.Item label="Name" {...formItemLayout}>
          {this.getNameField()}
        </Form.Item>
        <Form.Item label="Address" {...formItemLayout}>
          {this.getAddressField()}
        </Form.Item>
        <Form.Item {...buttonItemLayout}>
          <Row type="flex" justify="end">
            <Button type="secondary">Cancel</Button>
            &nbsp;
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Row>
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create()(NewForm);
