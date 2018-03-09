import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Table, Select, DatePicker } from 'antd';
import { get } from 'lodash';
import moment from 'moment';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs, WithListData } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import { Profiles } from '/imports/lib/collections/admin';
import { ItemStocks, ItemTypes, PhysicalStores } from '/imports/lib/collections/inventory';
import { Find as FindIssuanceForms } from '/imports/api/methods/inventory/issuance-forms';

import { getNameFromProfileId, getItemDisplayNameFromItemStockId } from '../common/helpers';

import ListFilter from './list-filter';

const ToolbarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
};

const FilterStyle = {
  width: '400px'
};

const StoreSelectStyle = {
  width: '300px'
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStores: PropTypes.array,
    itemStocks: PropTypes.array,
    itemTypes: PropTypes.array,
    profiles: PropTypes.array,

    data: PropTypes.array,
    pageCount: PropTypes.number,
    setListParams: PropTypes.func
  };

  columns = [
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: (text, record) => {
        const date = moment(text);
        return date.format('DD MMM, YYYY');
      }
    },
    {
      title: 'Issued To',
      dataIndex: 'issuedTo',
      key: 'issuedTo',
      render: (text, record) => {
        return getNameFromProfileId(text);
      }
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items, record) => {
        const formattedItems = items.map(item => {
          return `${getItemDisplayNameFromItemStockId(item.itemStockId)} - ${item.quantity}`;
        });
        return formattedItems.join(',');
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

  handleDateRangeChange = (dates, dateStrings) => {
    console.log(dateStrings);
  };

  getTableHeader = () => {
    const { physicalStores } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
          New Issuance Form
        </Button>
        <ListFilter filterCriteria={{}} physicalStores={physicalStores} />
        {/*
            <div style={FilterBoxStyle}>
              <div>
                Physical Store:&nbsp;
                <Select
                  defaultValue={selectedStoreId}
                  style={StoreSelectStyle}
                  onChange={this.handleStoreChanged}
                >
                  {options}
                </Select>
              </div>
              <div>
                Issue Dates:&nbsp;
                <DatePicker.RangePicker onChange={this.handleDateRangeChange} />
              </div>
            </div>
           */}
      </div>
    );
  };

  render() {
    const { data } = this.props;
    return (
      <Table
        rowKey={'_id'}
        dataSource={data}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
      />
    );
  }
}

function dataLoader(props, onData) {
  const { pageNumber, filterCriteria } = props;
  const physicalStoresSubscription = Meteor.subscribe('inventory/physicalStores#all');
  const itemStocksSubscription = Meteor.subscribe('inventory/itemStocks#all');
  const itemTypesSubscription = Meteor.subscribe('inventory/itemTypes#all');
  const profilesSubscription = Meteor.subscribe('admin/profiles#all');

  if (
    physicalStoresSubscription.ready() &&
    itemStocksSubscription.ready() &&
    itemTypesSubscription.ready() &&
    profilesSubscription.ready()
  ) {
    const physicalStores = PhysicalStores.find({}).fetch();
    const itemStocks = ItemStocks.find({}).fetch();
    const itemTypes = ItemTypes.find({}).fetch();
    const profiles = Profiles.find({}).fetch();
    onData(null, { physicalStores, itemStocks, itemTypes, profiles });
  }
}

export default merge(
  composeWithTracker(dataLoader),
  WithListData('IssuanceForms', FindIssuanceForms),
  WithBreadcrumbs(['Inventory', 'Forms', 'Issuance Forms', 'List'])
)(List);
