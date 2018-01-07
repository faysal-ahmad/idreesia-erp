import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Checkbox, Table } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/constants';
import { ItemTypes, ItemCategories } from '/imports/lib/collections/inventory';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    itemTypes: PropTypes.array,
    itemCategories: PropTypes.array
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`${paths.itemTypesPath}/${record._id}`}>{text}</Link>
    },
    {
      title: 'Category',
      dataIndex: 'itemCategoryId',
      key: 'itemCategoryId',
      render: (text, record) => {
        return this.getItemCategoryName(text);
      }
    },
    {
      title: 'Measurement Unit',
      dataIndex: 'unitOfMeasurement',
      key: 'unitOfMeasurement'
    },
    {
      title: 'Single Use',
      dataIndex: 'singleUse',
      key: 'singleUse',
      render: (value, record) => <Checkbox checked={value} disabled />
    }
  ];

  getItemCategoryName(itemCategoryId) {
    const itemCategory = ItemCategories.findOne(itemCategoryId);
    if (itemCategory) {
      return itemCategory.name;
    } else {
      return null;
    }
  }

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.itemTypesNewFormPath);
  };

  render() {
    const { itemTypes } = this.props;
    return (
      <Table
        rowKey={'_id'}
        dataSource={itemTypes}
        columns={this.columns}
        bordered
        title={() => {
          return (
            <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
              New Item Type
            </Button>
          );
        }}
      />
    );
  }
}

function dataLoader(props, onData) {
  const categoriesSubscription = Meteor.subscribe('inventory/itemCategories#all');
  const itemTypesSubscription = Meteor.subscribe('inventory/itemTypes#all');
  if (categoriesSubscription.ready() && itemTypesSubscription.ready()) {
    const itemTypes = ItemTypes.find({}).fetch();
    const itemCategories = ItemCategories.find({}).fetch();
    onData(null, { itemTypes, itemCategories });
  }
}

export default merge(
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Inventory', 'Setup', 'Item Types', 'List'])
)(List);
