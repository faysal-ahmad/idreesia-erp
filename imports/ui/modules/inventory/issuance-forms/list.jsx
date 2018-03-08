import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Table, Select, DatePicker } from 'antd';
import { get } from 'lodash';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs, WithListData } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import { IssuanceForms, PhysicalStores } from '/imports/lib/collections/inventory';
import { Find as FindIssuanceForms } from '/imports/api/methods/inventory/issuance-forms';

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
    issuanceForms: PropTypes.array,

    data: PropTypes.array,
    pageCount: PropTypes.number
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
  const issuanceFormsSubscription = Meteor.subscribe('inventory/issuanceForms#all', {
    pageNumber,
    filterCriteria
  });
  if (physicalStoresSubscription.ready() && issuanceFormsSubscription.ready()) {
    const physicalStores = PhysicalStores.find({}).fetch();
    const issuanceForms = IssuanceForms.find(
      {},
      {
        skip: 10 * (pageNumber - 1),
        limit: 10
      }
    ).fetch();
    onData(null, { physicalStores, issuanceForms });
  }
}

export default merge(
  composeWithTracker(dataLoader),
  WithListData('IssuanceForms', FindIssuanceForms),
  WithBreadcrumbs(['Inventory', 'Forms', 'Issuance Forms', 'List'])
)(List);
