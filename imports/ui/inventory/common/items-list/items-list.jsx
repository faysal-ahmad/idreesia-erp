import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Table, Modal } from 'antd';
import { merge } from 'react-komposer';

import { composeWithTracker } from '/imports/ui/utils';
import { ItemStocks } from '/imports/lib/collections/inventory';
import { default as ItemForm } from './item-form';
import { getItemTypeName, getItemCategoryName } from '../helpers';

const ButtonBarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-end',
  width: '100%'
};

class ItemsList extends Component {
  static propTypes = {
    physicalStoreId: PropTypes.string,
    itemStocks: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      showForm: false
    };
  }

  columns = [
    {
      title: 'Item Name',
      dataIndex: 'itemTypeId',
      key: 'name',
      render: (text, record) => `${getItemCategoryName(text)} - ${getItemTypeName(text)}`
    },
    {
      title: 'Issued',
      dataIndex: 'stockLevel',
      key: 'stockLevel'
    }
  ];

  handleNewItemClicked = () => {
    const state = Object.assign({}, this.state, { showForm: true });
    this.setState(state);
  };

  handleFormCancelled = () => {
    const state = Object.assign({}, this.state, { showForm: false });
    this.setState(state);
  };

  handleFormSaved = () => {};

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    }
  };

  render() {
    const { showForm } = this.state;
    return (
      <React.Fragment>
        <Table
          rowSelection={this.rowSelection}
          columns={this.columns}
          bordered
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
          onCancel={this.handleFormCancelled}
        >
          <ItemForm />
        </Modal>
      </React.Fragment>
    );
  }
}

function dataLoader(props, onData) {
  const { physicalStoreId } = props;
  const subscription = Meteor.subscribe('inventory/itemStocks#byStore', { physicalStoreId });
  if (subscription.ready()) {
    const itemStocks = ItemStocks.find({}).fetch();
    onData(null, { itemStocks });
  }
}

export default composeWithTracker(dataLoader)(ItemsList);
