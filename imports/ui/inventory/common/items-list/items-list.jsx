import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Modal } from 'antd';
import { merge } from 'react-komposer';
import { filter, find } from 'lodash';

import { composeWithTracker } from '/imports/ui/utils';
import { ItemTypes, ItemCategories, ItemStocks } from '/imports/lib/collections/inventory';
import { default as ItemForm } from './item-form';
import { getItemDisplayNameFromItemStockId } from '../helpers';

const ButtonBarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-end',
  width: '100%'
};

class ItemsList extends Component {
  static propTypes = {
    physicalStoreId: PropTypes.string,
    itemTypes: PropTypes.array,
    itemCategories: PropTypes.array,

    value: PropTypes.array,
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      showForm: false,
      itemStocks: props.value ? props.value : [],
      selectedItemStockIds: []
    };
  }

  itemForm = null;
  stockItemsTable = null;

  columns = [
    {
      title: 'Item Name',
      dataIndex: 'itemStockId',
      key: 'itemStockId',
      render: (text, record) => getItemDisplayNameFromItemStockId(text)
    },
    {
      title: 'Issued',
      dataIndex: 'issued',
      key: 'issued'
    }
  ];

  handleNewItemClicked = () => {
    const state = Object.assign({}, this.state, { showForm: true });
    this.setState(state);
  };

  handleRemoveItemClicked = () => {
    const { itemStocks, selectedItemStockIds } = this.state;
    if (selectedItemStockIds && selectedItemStockIds.length > 0) {
      const updatedItemStocks = filter(itemStocks, itemStock => {
        return selectedItemStockIds.indexOf(itemStock.itemStockId) === -1;
      });

      const state = Object.assign({}, this.state, {
        itemStocks: updatedItemStocks,
        selectedItemStockIds: []
      });
      this.setState(state);

      const { onChange } = this.props;
      if (onChange) {
        onChange(updatedItemStocks);
      }
    }
  };

  handleNewItemFormCancelled = () => {
    const state = Object.assign({}, this.state, { showForm: false });
    this.setState(state);
  };

  handleNewItemFormSaved = () => {
    this.itemForm.validateFields(null, (errors, values) => {
      if (!errors) {
        const { itemStockId, issued } = values;
        const { itemStocks } = this.state;
        // If we have an existing item against this itemStockId, then add the issued
        // count to the existing item instead of adding a new item.
        const existingItem = find(itemStocks, { itemStockId });
        if (!existingItem) {
          itemStocks.push({ itemStockId, issued });
        } else {
          existingItem.issued += issued;
        }

        const state = Object.assign({}, this.state, {
          showForm: false,
          itemStocks
        });
        this.setState(state);

        const { onChange } = this.props;
        if (onChange) {
          onChange(itemStocks);
        }
      }
    });
  };

  handleRowSelectionChanged = (selectedRowKeys, selectedRows) => {
    const state = Object.assign({}, this.state, {
      selectedItemStockIds: selectedRowKeys
    });
    this.setState(state);
  };

  render() {
    const { showForm, selectedItemStockIds } = this.state;
    const { itemTypes, itemCategories, itemStocks } = this.props;
    const rowSelection = {
      selectedRowKeys: selectedItemStockIds,
      onChange: this.handleRowSelectionChanged
    };

    return (
      <React.Fragment>
        <Table
          ref={t => (this.stockItemsTable = t)}
          rowKey="itemStockId"
          rowSelection={rowSelection}
          columns={this.columns}
          bordered
          pagination={false}
          dataSource={this.state.itemStocks}
          footer={() => {
            return (
              <div style={ButtonBarStyle}>
                <Button
                  type="secondary"
                  icon="minus-circle-o"
                  onClick={this.handleRemoveItemClicked}
                >
                  Remove Item
                </Button>
                &nbsp;
                <Button type="primary" icon="plus-circle-o" onClick={this.handleNewItemClicked}>
                  Add Item
                </Button>
              </div>
            );
          }}
        />
        <Modal
          visible={showForm}
          title="Add New Item"
          okText="Save"
          destroyOnClose={true}
          onOk={this.handleNewItemFormSaved}
          onCancel={this.handleNewItemFormCancelled}
        >
          <ItemForm
            ref={f => (this.itemForm = f)}
            itemTypes={itemTypes}
            itemCategories={itemCategories}
            itemStocks={itemStocks}
          />
        </Modal>
      </React.Fragment>
    );
  }
}

function dataLoader(props, onData) {
  const { physicalStoreId } = props;
  const itemTypesSubscription = Meteor.subscribe('inventory/itemTypes#all');
  const itemCategoriesSubscription = Meteor.subscribe('inventory/itemCategories#all');
  const itemStocksSubscription = Meteor.subscribe('inventory/itemStocks#byStore', {
    physicalStoreId
  });

  if (
    itemTypesSubscription.ready() &&
    itemCategoriesSubscription.ready() &&
    itemStocksSubscription.ready()
  ) {
    const itemTypes = ItemTypes.find({}).fetch();
    const itemCategories = ItemCategories.find({}).fetch();
    const itemStocks = ItemStocks.find({
      physicalStoreId: { $eq: physicalStoreId }
    }).fetch();
    onData(null, { itemTypes, itemCategories, itemStocks });
  }
}

export default composeWithTracker(dataLoader)(ItemsList);
