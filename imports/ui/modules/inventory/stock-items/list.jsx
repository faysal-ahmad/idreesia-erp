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

    allStockItems: PropTypes.array,
    allPhysicalStores: PropTypes.array,
  };

  /*
  componentWillMount() {
    const { physicalStores } = this.props;
    if (physicalStores.length > 0) {
      const selectedStoreId = physicalStores[0]._id;
      const itemStocks = ItemStocks.find({
        physicalStoreId: { $eq: selectedStoreId },
      }).fetch();

      const state = {
        selectedStoreId,
        itemStocks,
      };
      this.setState(state);
    }
  }
*/
  getTableHeader = () => {
    const { history, location, queryParams, allPhysicalStores } = this.props;

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
    const { allStockItems } = this.props;
    return (
      <Table
        rowKey="_id"
        dataSource={allStockItems}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
      />
    );
  }
}

const listQuery = gql`
  query allStockItems {
    allStockItems {
      _id
      itemTypeName
      itemTypePicture
      itemCategoryName
      minStockLevel
      currentStockLevel
      totalStockLevel
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
  }),
  WithBreadcrumbs(['Inventory', 'Stock Items', 'List'])
)(List);
