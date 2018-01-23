import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { PhysicalStores } from '/imports/lib/collections/inventory';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStore: PropTypes.object
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.physicalStoresPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const { physicalStore } = this.props;
      const doc = Object.assign({}, physicalStore, {
        name: fieldsValue.name,
        address: fieldsValue.address
      });

      Meteor.call('inventory/physicalStores.update', { doc }, (error, result) => {
        if (error) return;
        const { history } = this.props;
        history.push(paths.physicalStoresPath);
      });
    });
  };

  getNameField() {
    const { physicalStore } = this.props;
    const { getFieldDecorator } = this.props.form;
    const initialValue = physicalStore.name;
    const rules = [
      {
        required: true,
        message: 'Please input a name for the physical store.'
      }
    ];
    return getFieldDecorator('name', { initialValue, rules })(
      <Input placeholder="Physical store name" />
    );
  }

  getAddressField() {
    const { physicalStore } = this.props;
    const { getFieldDecorator } = this.props.form;
    const initialValue = physicalStore.address;
    const rules = [];
    return getFieldDecorator('address', { initialValue, rules })(
      <Input.TextArea rows={5} placeholder="Physical store address" />
    );
  }

  render() {
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
            <Button type="secondary" onClick={this.handleCancel}>
              Cancel
            </Button>
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

function dataLoader(props, onData) {
  const { match } = props;
  const { physicalStoreId } = match.params;
  const subscription = Meteor.subscribe('inventory/physicalStores#byId', { id: physicalStoreId });
  if (subscription.ready()) {
    const physicalStore = PhysicalStores.findOne(physicalStoreId);
    onData(null, { physicalStore });
  }
}

export default merge(
  Form.create(),
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Inventory', 'Setup', 'Physical Stores', 'Edit'])
)(EditForm);
