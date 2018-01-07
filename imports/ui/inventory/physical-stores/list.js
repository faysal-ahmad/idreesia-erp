import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Table } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { InventorySubModulePaths as paths } from '/imports/ui/constants';
import { PhysicalStores } from '/imports/lib/collections/inventory';

class Container extends React.Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStores: PropTypes.array
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address'
    }
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.physicalStoresNewFormPath);
  };

  render() {
    const { physicalStores } = this.props;
    return (
      <Table
        rowKey={'_id'}
        dataSource={physicalStores}
        columns={this.columns}
        bordered
        title={() => {
          return (
            <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
              New Physical Store
            </Button>
          );
        }}
      />
    );
  }
}

function dataLoader(props, onData) {
  const subscription = Meteor.subscribe('inventory/physicalStores#all');
  if (subscription.ready()) {
    const physicalStores = PhysicalStores.find({}).fetch();
    onData(null, { physicalStores });
  }
}

export default composeWithTracker(dataLoader)(Container);
