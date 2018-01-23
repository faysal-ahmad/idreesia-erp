import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Table, Select } from 'antd';
import { get } from 'lodash';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import { IssuanceForms, PhysicalStores } from '/imports/lib/collections/inventory';

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
    physicalStores: PropTypes.array,
    issuanceForms: PropTypes.array
  };

  columns = [
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (text, record) => {
        text;
      }
    },
    {
      title: 'Issued To',
      dataIndex: 'issuedTo',
      key: 'issuedTo',
      render: (text, record) => {
        text;
      }
    }
  ];

  constructor(props) {
    super(props);
    this.state = {
      selectedStoreId: null
    };
  }

  componentWillMount() {
    const { physicalStores } = this.props;
    if (physicalStores.length > 0) {
      const selectedStoreId = physicalStores[0]._id;
      const state = { selectedStoreId };
      this.setState(state);
    }
  }

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.issuanceFormsNewFormPath);
  };

  handleStoreChanged = value => {
    const selectedStoreId = value;
    const state = Object.assign({}, this.state, { selectedStoreId });
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
          New Issuance Form
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
    const { issuanceForms } = this.props;
    return (
      <Table
        rowKey={'_id'}
        dataSource={issuanceForms}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
      />
    );
  }
}

function dataLoader(props, onData) {
  const pageId = get(props, ['match', 'params', 'pageId'], 1);
  const physicalStoresSubscription = Meteor.subscribe('inventory/physicalStores#all');
  const issuanceFormsSubscription = Meteor.subscribe('inventory/issuanceForms#all', { pageId });
  if (physicalStoresSubscription.ready() && issuanceFormsSubscription.ready()) {
    const physicalStores = PhysicalStores.find({}).fetch();
    const issuanceForms = IssuanceForms.find(
      {},
      {
        skip: 10 * (pageId - 1),
        limit: 10
      }
    ).fetch();
    onData(null, { physicalStores, issuanceForms });
  }
}

export default merge(
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Inventory', 'Forms', 'Issuance Forms', 'List'])
)(List);
