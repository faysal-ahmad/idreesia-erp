import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Table } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import { PhysicalStores } from '/imports/lib/collections/inventory';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStores: PropTypes.array
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`${paths.physicalStoresPath}/${record._id}`}>{text}</Link>
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

export default merge(
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Inventory', 'Setup', 'Physical Stores', 'List'])
)(List);
