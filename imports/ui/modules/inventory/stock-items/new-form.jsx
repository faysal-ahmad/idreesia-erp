import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, InputNumber, Button, Row, Select } from 'antd';
import { map } from 'lodash';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import {
  ItemStocks,
  ItemTypes,
  ItemCategories,
  PhysicalStores
} from '/imports/lib/collections/inventory';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    itemStocks: PropTypes.array,
    itemTypes: PropTypes.array,
    itemCategories: PropTypes.array,
    physicalStores: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedPhysicalStoreId: null,
      selectedItemCategoryId: null
    };
  }

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.stockItemsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const doc = {
        itemTypeId: fieldsValue.itemTypeId,
        physicalStoreId: fieldsValue.physicalStoreId,
        minStockLevel: fieldsValue.minStockLevel,
        currentStockLevel: fieldsValue.currentStockLevel
      };

      Meteor.call('inventory/itemStocks.create', { doc }, (error, result) => {
        if (error) return;
        const { history } = this.props;
        history.push(paths.stockItemsPath);
      });
    });
  };

  getPhysicalStoreField() {
    const { physicalStores } = this.props;
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please select a physical store.'
      }
    ];
    const options = [];
    physicalStores.forEach(physicalStore => {
      options.push(
        <Select.Option key={physicalStore._id} value={physicalStore._id}>
          {physicalStore.name}
        </Select.Option>
      );
    });

    return getFieldDecorator('physicalStoreId', { rules })(
      <Select placeholder="Please select a physical store." onChange={this.handleStoreChanged}>
        {options}
      </Select>
    );
  }

  getItemCategoryField() {
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
      <Select placeholder="Please select an item category." onChange={this.handleCategoryChanged}>
        {options}
      </Select>
    );
  }

  getItemTypeField() {
    const options = [];
    const { getFieldDecorator } = this.props.form;
    const { selectedPhysicalStoreId, selectedItemCategoryId } = this.state;
    if (selectedPhysicalStoreId && selectedItemCategoryId) {
      // Get all the item types for which we already have defined stock items in this store
      const existingStockItems = ItemStocks.find({
        physicalStoreId: { $eq: selectedPhysicalStoreId }
      }).fetch();

      const itemTypeIds = map(existingStockItems, stockItem => stockItem.itemTypeId);
      // Get all the item types for which we don't yet have stock items in this store. Filter
      // them by the selected item category.
      const unstockedItemTypes = ItemTypes.find({
        itemCategoryId: { $eq: selectedItemCategoryId },
        _id: { $nin: itemTypeIds }
      }).fetch();

      unstockedItemTypes.forEach(itemType => {
        options.push(
          <Select.Option key={itemType._id} value={itemType._id}>
            {itemType.name}
          </Select.Option>
        );
      });
    }

    const rules = [
      {
        required: true,
        message: 'Please select an item type.'
      }
    ];

    return getFieldDecorator('itemTypeId', { rules })(
      <Select placeholder="Please select an item type.">{options}</Select>
    );
  }

  getMinStockLevelField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [];
    return getFieldDecorator('minStockLevel', { rules })(<InputNumber />);
  }

  getCurrentStockLevelField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [];
    return getFieldDecorator('currentStockLevel', { rules })(<InputNumber />);
  }

  handleStoreChanged = value => {
    const state = Object.assign({}, this.state, {
      selectedPhysicalStoreId: value
    });
    this.setState(state);
  };

  handleCategoryChanged = value => {
    const state = Object.assign({}, this.state, {
      selectedItemCategoryId: value
    });
    this.setState(state);
  };

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
        <Form.Item label="Physical Store" {...formItemLayout}>
          {this.getPhysicalStoreField()}
        </Form.Item>
        <Form.Item label="Item Category" {...formItemLayout}>
          {this.getItemCategoryField()}
        </Form.Item>
        <Form.Item label="Item Type" {...formItemLayout}>
          {this.getItemTypeField()}
        </Form.Item>
        <Form.Item label="Min Stock Level" {...formItemLayout}>
          {this.getMinStockLevelField()}
        </Form.Item>
        <Form.Item label="Current Stock Level" {...formItemLayout}>
          {this.getCurrentStockLevelField()}
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
  const physicalStoresSubscription = Meteor.subscribe('inventory/physicalStores#all');
  const itemCategoriesSubscription = Meteor.subscribe('inventory/itemCategories#all');
  const itemTypesSubscription = Meteor.subscribe('inventory/itemTypes#all');
  const itemStocksSubscription = Meteor.subscribe('inventory/itemStocks#all');

  if (
    physicalStoresSubscription.ready() &&
    itemCategoriesSubscription.ready() &&
    itemTypesSubscription.ready() &&
    itemStocksSubscription.ready()
  ) {
    const physicalStores = PhysicalStores.find({}).fetch();
    const itemCategories = ItemCategories.find({}).fetch();
    const itemTypes = ItemTypes.find({}).fetch();
    const itemStocks = ItemStocks.find({}).fetch();
    onData(null, { physicalStores, itemCategories, itemTypes, itemStocks });
  }
}

export default merge(
  Form.create(),
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Inventory', 'Stock Items', 'New'])
)(NewForm);
