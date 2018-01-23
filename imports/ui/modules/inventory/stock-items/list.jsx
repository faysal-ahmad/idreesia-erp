import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Table, Select } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  ItemStocks,
  ItemTypes,
  ItemCategories,
  PhysicalStores
} from '/imports/lib/collections/inventory';

const ToolbarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  width: '100%'
};

const StoreSelectStyle = {
  width: '300px'
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    itemStocks: PropTypes.array,
    itemTypes: PropTypes.array,
    itemCategories: PropTypes.array,
    physicalStores: PropTypes.array
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'itemTypeId',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.stockItemsPath}/${record._id}`}>{this.getItemTypeName(text)}</Link>
      )
    },
    {
      title: 'Category',
      dataIndex: 'itemTypeId',
      key: 'category',
      render: (text, record) => this.getItemCategoryName(text)
    },
    {
      title: 'Min Stock',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel'
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStockLevel',
      key: 'currentStockLevel'
    }
  ];

  constructor(props) {
    super(props);
    this.state = {
      selectedStoreId: null,
      itemStocks: null
    };
  }

  componentWillMount() {
    const { physicalStores } = this.props;
    if (physicalStores.length > 0) {
      const selectedStoreId = physicalStores[0]._id;
      const itemStocks = ItemStocks.find({
        physicalStoreId: { $eq: selectedStoreId }
      }).fetch();

      const state = {
        selectedStoreId,
        itemStocks
      };
      this.setState(state);
    }
  }

  getItemTypeName(itemTypeId) {
    let retVal = null;
    const itemType = ItemTypes.findOne(itemTypeId);
    if (itemType) {
      retVal = itemType.name;
    }

    return retVal;
  }

  getItemCategoryName(itemTypeId) {
    let retVal = null;
    const itemType = ItemTypes.findOne(itemTypeId);
    if (itemType) {
      const itemCategory = ItemCategories.findOne(itemType.itemCategoryId);
      if (itemCategory) retVal = itemCategory.name;
    }

    return retVal;
  }

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.stockItemsNewFormPath);
  };

  handleStoreChanged = value => {
    const selectedStoreId = value;
    const itemStocks = ItemStocks.find({
      physicalStoreId: { $eq: selectedStoreId }
    }).fetch();

    const state = Object.assign({}, this.state, {
      selectedStoreId,
      itemStocks
    });
    this.setState(state);
  };

  getTableHeader = () => {
    const { physicalStores } = this.props;
    const { selectedStoreId } = this.state;
    const options = [];
    physicalStores.forEach(physicalStore => {
      options.push(
        <Select.Option key={physicalStore._id} value={physicalStore._id}>
          {physicalStore.name}
        </Select.Option>
      );
    });

    return (
      <div style={ToolbarStyle}>
        <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
          New Stock Item
        </Button>
        <div>
          Select Store:&nbsp;
          <Select
            defaultValue={selectedStoreId}
            style={StoreSelectStyle}
            onChange={this.handleStoreChanged}
          >
            {options}
          </Select>
        </div>
      </div>
    );
  };

  render() {
    const { itemStocks } = this.state;
    return (
      <Table
        rowKey={'_id'}
        dataSource={itemStocks}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
      />
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

export default merge(composeWithTracker(dataLoader), WithBreadcrumbs(['Inventory', 'Stock Items']))(
  List
);
