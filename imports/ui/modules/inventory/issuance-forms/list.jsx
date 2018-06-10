import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Pagination, Table } from 'antd';
import moment from 'moment';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { isFinite, toSafeInteger } from 'lodash';

import { WithBreadcrumbs, WithQueryParams } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

import { getNameFromProfileId } from '../common/helpers';

import ListFilter from './list-filter';

const ToolbarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,

    loading: PropTypes.bool,
    pagedIssuanceForms: PropTypes.shape({
      totalResults: PropTypes.number,
      issuanceForms: PropTypes.array,
    }),
    allPhysicalStores: PropTypes.array,
  };

  columns = [
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: text => {
        const date = moment(text);
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Issued To',
      dataIndex: 'issuedTo',
      key: 'issuedTo',
      render: text => getNameFromProfileId(text),
    },
    /*    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items, record) => {
        const formattedItems = items.map(
          item => `${getItemDisplayNameFromItemStockId(item.itemStockId)} - ${item.quantity}`
        );
        return formattedItems.join(',');
      },
    }, */
  ];

  constructor(props) {
    super(props);
    this.state = {
      selectedStoreId: null,
    };
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
    const { allPhysicalStores } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
          New Issuance Form
        </Button>
        <ListFilter filterCriteria={{}} physicalStores={allPhysicalStores} />
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
    const { loading } = this.props;
    if (loading) return null;

    const {
      queryParams: { pageIndex, pageSize },
      pagedIssuanceForms: { totalResults, issuanceForms },
    } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={issuanceForms}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
        footer={() => (
          <Pagination
            defaultCurrent={1}
            defaultPageSize={10}
            current={isFinite(pageIndex) ? toSafeInteger(pageIndex) + 1 : 1}
            pageSize={isFinite(pageSize) ? toSafeInteger(pageSize) : 10}
            showSizeChanger
            onChange={this.onChange}
            onShowSizeChange={this.onShowSizeChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}

const listQuery = gql`
  query pagedIssuanceForms($queryString: String) {
    pagedIssuanceForms(queryString: $queryString) {
      totalResults
      issuanceForms {
        _id
        issueDate
        issuedBy
        issuedTo
        physicalStoreId
        items {
          stockItemId
          quantity
        }
      }
    }
  }
`;

const physicalStoresListQuery = gql`
  query allPhysicalStores {
    allPhysicalStores {
      _id
      name
    }
  }
`;

export default compose(
  WithQueryParams(),
  graphql(physicalStoresListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ queryString }) => ({ variables: { queryString } }),
  }),
  WithBreadcrumbs(['Inventory', 'Forms', 'Issuance Forms', 'List'])
)(List);
