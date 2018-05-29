import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Avatar, Button, Table } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { WithBreadcrumbs, WithQueryParams } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

import ListFilter from './list-filter';

const NameDivStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
  width: '100%',
};

const ToolbarStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  width: '100%',
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,

    loading: PropTypes.bool,
    allStockItems: PropTypes.array,
    allPhysicalStores: PropTypes.array,
    allItemCategories: PropTypes.array,
  };

  getTableHeader = () => {
    const { history, location, queryParams, allPhysicalStores, allItemCategories } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
          New Stock Item
        </Button>
        <ListFilter
          history={history}
          location={location}
          queryParams={queryParams}
          allPhysicalStores={allPhysicalStores}
          allItemCategories={allItemCategories}
        />
      </div>
    );
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.stockItemsNewFormPath);
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'itemTypeName',
      key: 'itemTypeName',
      render: (text, record) => {
        if (record.itemTypePicture) {
          return (
            <div style={NameDivStyle}>
              <Avatar shape="square" size="large" src={record.itemTypePicture} />
              &nbsp;
              <Link to={`${paths.stockItemsPath}/${record._id}`}>{text}</Link>
            </div>
          );
        }

        return (
          <div style={NameDivStyle}>
            <Avatar shape="square" size="large" icon="picture" />
            &nbsp;
            <Link to={`${paths.stockItemsPath}/${record._id}`}>{text}</Link>
          </div>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'itemCategoryName',
      key: 'itemCategoryName',
    },
    {
      title: 'Min Stock',
      dataIndex: 'minStockLevel',
      key: 'minStockLevel',
    },
    {
      title: 'Current Stock',
      dataIndex: 'currentStockLevel',
      key: 'currentStockLevel',
    },
    {
      title: 'Total Stock',
      dataIndex: 'totalStockLevel',
      key: 'totalStockLevel',
    },
  ];

  render() {
    const { allStockItems, loading } = this.props;
    if (loading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={allStockItems.stockItems}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
      />
    );
  }
}

const listQuery = gql`
  query allStockItems($queryString: String) {
    allStockItems(queryString: $queryString) {
      totalResults
      stockItems {
        _id
        itemTypeName
        itemTypePicture
        itemCategoryName
        minStockLevel
        currentStockLevel
        totalStockLevel
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

const itemCategoriesListQuery = gql`
  query allItemCategories {
    allItemCategories {
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
  graphql(itemCategoriesListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ queryString }) => ({ variables: { queryString } }),
  }),
  WithBreadcrumbs(['Inventory', 'Stock Items', 'List'])
)(List);
