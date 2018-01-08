import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Table } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/constants';
import { ItemCategories } from '/imports/lib/collections/inventory';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    itemCategories: PropTypes.array
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`${paths.itemCategoriesPath}/${record._id}`}>{text}</Link>
    }
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.itemCategoriesNewFormPath);
  };

  render() {
    const { itemCategories } = this.props;
    return (
      <Table
        rowKey={'_id'}
        dataSource={itemCategories}
        columns={this.columns}
        bordered
        title={() => {
          return (
            <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
              New Item Category
            </Button>
          );
        }}
      />
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
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Inventory', 'Setup', 'Item Categories', 'List'])
)(List);
