import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AutoComplete, Form, Input, InputNumber } from 'antd';
import { keyBy } from 'lodash';

import { ItemCategories } from '/imports/lib/collections/inventory';

const OptionStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  width: '100%'
};

class ItemForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    itemTypes: PropTypes.array,
    itemCategories: PropTypes.array,
    itemStocks: PropTypes.array
  };

  getNameField() {
    const { itemTypes, itemCategories, itemStocks } = this.props;
    const itemStocksMap = keyBy(itemStocks, '_id');
    const itemTypesMap = keyBy(itemTypes, '_id');
    const itemCategoriesMap = keyBy(itemCategories, '_id');

    const { getFieldDecorator } = this.props.form;
    const children = [];

    itemStocks.forEach(itemStock => {
      const itemType = itemTypesMap[itemStock.itemTypeId];
      const itemCategory = itemCategoriesMap[itemType.itemCategoryId];
      children.push(
        <AutoComplete.Option key={itemStock._id} value={itemStock._id} text={itemType.name}>
          <div style={OptionStyle}>
            {itemType.name}
            <span>{itemStock.currentStockLevel} Available</span>
          </div>
        </AutoComplete.Option>
      );
    });

    const rules = [
      {
        required: true,
        message: 'Please input a name for the item.'
      },
      {
        message: 'Please choose a valid item.',
        validator: (rule, value, callback) => {
          const selectItemStock = itemStocksMap[value];
          if (!selectItemStock) {
            const error = new Error('This is not a valid item.');
            callback([error]);
          }

          callback();
        }
      }
    ];
    return getFieldDecorator('itemStockId', { rules })(
      <AutoComplete
        placeholder="Item name"
        filterOption={true}
        optionLabelProp="text"
        backfill={true}
      >
        {children}
      </AutoComplete>
    );
  }

  getQuantityField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please input a numeric value for quantity.'
      }
    ];
    return getFieldDecorator('quantity', { rules })(<InputNumber min={0} placeholder="0" />);
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
        <Form.Item label="Quantity" {...formItemLayout}>
          {this.getQuantityField()}
        </Form.Item>
      </Form>
    );
  }
}

export default Form.create()(ItemForm);
