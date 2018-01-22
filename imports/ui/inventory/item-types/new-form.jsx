import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row, Select, Switch } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { ItemTypes, ItemCategories } from '/imports/lib/collections/inventory';
import { InventorySubModulePaths as paths } from '/imports/ui/constants';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    itemCategories: PropTypes.array
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.itemTypesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const doc = {
        name: fieldsValue.name,
        description: fieldsValue.description,
        itemCategoryId: fieldsValue.itemCategoryId,
        unitOfMeasurement: fieldsValue.unitOfMeasurement,
        singleUse: fieldsValue.singleUse
      };

      Meteor.call('inventory/itemTypes.create', { doc }, (error, result) => {
        if (error) return;
        const { history } = this.props;
        history.push(paths.itemTypesPath);
      });
    });
  };

  getNameField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please input a name for the item type.'
      }
    ];
    return getFieldDecorator('name', { rules })(<Input placeholder="Item type name" />);
  }

  getDescriptionField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [];
    return getFieldDecorator('description', { rules })(
      <Input.TextArea rows={5} placeholder="Item type description" />
    );
  }

  getCategoryField() {
    const { itemCategories } = this.props;
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please select an item category.'
      }
    ];
    const options = [];
    itemCategories.forEach(itemCategory => {
      options.push(
        <Select.Option key={itemCategory._id} value={itemCategory._id}>
          {itemCategory.name}
        </Select.Option>
      );
    });

    return getFieldDecorator('itemCategoryId', { rules })(
      <Select placeholder="Please select an item category.">{options}</Select>
    );
  }

  getUnitOfMeasurementField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please select a unit of measurement.'
      }
    ];

    return getFieldDecorator('unitOfMeasurement', { rules })(
      <Select placeholder="Please select a unit of measurement.">
        <Select.Option value="quantity">Quantity</Select.Option>
        <Select.Option value="ft">Length (ft)</Select.Option>
        <Select.Option value="m">Length (m)</Select.Option>
        <Select.Option value="kg">Weight (kg)</Select.Option>
        <Select.Option value="lbs">Weight (lbs)</Select.Option>
      </Select>
    );
  }

  getSingleUseField() {
    const { getFieldDecorator } = this.props.form;
    const initialValue = true;
    return getFieldDecorator('singleUse', { initialValue })(<Switch defaultChecked />);
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 }
    };

    const buttonItemLayout = {
      wrapperCol: { span: 14, offset: 6 }
    };

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <Form.Item label="Name" {...formItemLayout}>
          {this.getNameField()}
        </Form.Item>
        <Form.Item label="Description" {...formItemLayout}>
          {this.getDescriptionField()}
        </Form.Item>
        <Form.Item label="Category" {...formItemLayout}>
          {this.getCategoryField()}
        </Form.Item>
        <Form.Item label="Measurement Unit" {...formItemLayout}>
          {this.getUnitOfMeasurementField()}
        </Form.Item>
        <Form.Item label="Single Use Item" {...formItemLayout}>
          {this.getSingleUseField()}
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
  const subscription = Meteor.subscribe('inventory/itemCategories#all');
  if (subscription.ready()) {
    const itemCategories = ItemCategories.find({}).fetch();
    onData(null, { itemCategories });
  }
}

export default merge(
  Form.create(),
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Inventory', 'Setup', 'Item Types', 'New'])
)(NewForm);
