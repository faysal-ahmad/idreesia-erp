import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Avatar, Button, Table, Pagination } from 'antd';
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
    allStockItems: PropTypes.shape({
      totalResults: PropTypes.number,
      stockItems: PropTypes.array,
    }),
    allPhysicalStores: PropTypes.array,
    allItemCategories: PropTypes.array,
  };

  getTableHeader = () => {
    const { queryParams, allPhysicalStores, allItemCategories } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
          New Stock Item
        </Button>
        <ListFilter
          refreshPage={this.refreshPage}
          queryParams={queryParams}
          allPhysicalStores={allPhysicalStores}
          allItemCategories={allItemCategories}
        />
      </div>
    );
  };

  refreshPage = ({ physicalStoreId, itemCategoryId, itemTypeName, pageIndex, pageSize }) => {
    const { queryParams, history, location } = this.props;
    let physicalStoreIdVal;
    if (physicalStoreId !== undefined) physicalStoreIdVal = physicalStoreId;
    else physicalStoreIdVal = queryParams.physicalStoreId || '';

    let itemCategoryIdVal;
    if (itemCategoryId !== undefined) itemCategoryIdVal = itemCategoryId;
    else itemCategoryIdVal = queryParams.itemCategoryId || '';

    let itemTypeNameVal;
    if (itemTypeName !== undefined) itemTypeNameVal = itemTypeName;
    else itemTypeNameVal = queryParams.itemTypeName || '';

    let pageIndexVal;
    if (pageIndex !== undefined) pageIndexVal = pageIndex;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (pageSize !== undefined) pageSizeVal = pageSize;
    else pageSizeVal = queryParams.pageSize || 10;

    const path = `${
      location.pathname
    }?physicalStoreId=${physicalStoreIdVal}&itemCategoryId=${itemCategoryIdVal}&itemTypeName=${itemTypeNameVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.stockItemsNewFormPath);
  };

  onChange = (pageIndex, pageSize) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    this.refreshPage({
      pageIndex: pageIndex - 1,
      pageSize,
    });
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
    const { loading } = this.props;
    if (loading) return null;

    const {
      queryParams,
      allStockItems: { totalResults, stockItems },
    } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={stockItems}
        columns={this.columns}
        bordered
        pagination={false}
        title={this.getTableHeader}
        footer={() => (
          <Pagination
            defaultCurrent={1}
            defaultPageSize={10}
            current={queryParams.pageIndex + 1}
            pageSize={queryParams.pageSize}
            showSizeChanger
            onShowSizeChange={this.onShowSizeChange}
            total={totalResults}
          />
        )}
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
