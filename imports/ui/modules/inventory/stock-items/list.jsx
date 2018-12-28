import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Avatar, Button, Table, Pagination } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { toSafeInteger } from "lodash";

import { WithBreadcrumbs, WithQueryParams } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import { WithPhysicalStoreId } from "/imports/ui/modules/inventory/common/composers";

import ListFilter from "./list-filter";

const NameDivStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "100%",
};

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  width: "100%",
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,

    physicalStoreId: PropTypes.string,
    queryString: PropTypes.string,
    queryParams: PropTypes.object,

    loading: PropTypes.bool,
    pagedStockItems: PropTypes.shape({
      totalResults: PropTypes.number,
      stockItems: PropTypes.array,
    }),
    allItemCategories: PropTypes.array,
  };

  getTableHeader = () => {
    const { queryParams, allItemCategories } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button
          type="primary"
          icon="plus-circle-o"
          onClick={this.handleNewClicked}
        >
          New Stock Item
        </Button>
        <ListFilter
          refreshPage={this.refreshPage}
          queryParams={queryParams}
          allItemCategories={allItemCategories}
        />
      </div>
    );
  };

  refreshPage = newParams => {
    const { itemCategoryId, itemTypeName, pageIndex, pageSize } = newParams;
    const { queryParams, history, location } = this.props;

    let itemCategoryIdVal;
    if (newParams.hasOwnProperty("itemCategoryId"))
      itemCategoryIdVal = itemCategoryId || "";
    else itemCategoryIdVal = queryParams.itemCategoryId || "";

    let itemTypeNameVal;
    if (newParams.hasOwnProperty("itemTypeName"))
      itemTypeNameVal = itemTypeName || "";
    else itemTypeNameVal = queryParams.itemTypeName || "";

    let pageIndexVal;
    if (newParams.hasOwnProperty("pageIndex")) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (newParams.hasOwnProperty("pageSize")) pageSizeVal = pageSize || 10;
    else pageSizeVal = queryParams.pageSize || 10;

    const path = `${
      location.pathname
    }?itemCategoryId=${itemCategoryIdVal}&itemTypeName=${itemTypeNameVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.stockItemsNewFormPath(physicalStoreId));
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

  getColumnDefinitions = () => {
    const { physicalStoreId } = this.props;
    return [
      {
        title: "Name",
        dataIndex: "itemTypeName",
        key: "itemTypeName",
        render: (text, record) => {
          if (record.itemTypePicture) {
            return (
              <div style={NameDivStyle}>
                <Avatar
                  shape="square"
                  size="large"
                  src={record.itemTypePicture}
                />
                &nbsp;
                <Link
                  to={`${paths.stockItemsPath(physicalStoreId)}/${record._id}`}
                >
                  {text}
                </Link>
              </div>
            );
          }

          return (
            <div style={NameDivStyle}>
              <Avatar shape="square" size="large" icon="picture" />
              &nbsp;
              <Link
                to={`${paths.stockItemsPath(physicalStoreId)}/${record._id}`}
              >
                {text}
              </Link>
            </div>
          );
        },
      },
      {
        title: "Company",
        dataIndex: "itemTypeCompany",
        key: "itemTypeCompany",
      },
      {
        title: "Details",
        dataIndex: "itemTypeDetails",
        key: "itemTypeDetails",
      },
      {
        title: "Category",
        dataIndex: "itemCategoryName",
        key: "itemCategoryName",
      },
      {
        title: "Min Stock",
        dataIndex: "minStockLevel",
        key: "minStockLevel",
        render: (text, record) => {
          if (!text) return "";
          if (record.unitOfMeasurement !== "quantity")
            return `${text} ${record.unitOfMeasurement}`;
          return text;
        },
      },
      {
        title: "Current Stock",
        dataIndex: "currentStockLevel",
        key: "currentStockLevel",
        render: (text, record) => {
          if (!text) return "";
          if (record.unitOfMeasurement !== "quantity")
            return `${text} ${record.unitOfMeasurement}`;
          return text;
        },
      },
    ];
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      queryParams: { pageIndex, pageSize },
      pagedStockItems: { totalResults, stockItems },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 10;

    return (
      <Table
        rowKey="_id"
        dataSource={stockItems}
        columns={this.getColumnDefinitions()}
        bordered
        size="small"
        pagination={false}
        title={this.getTableHeader}
        footer={() => (
          <Pagination
            defaultCurrent={1}
            defaultPageSize={10}
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
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
  query pagedStockItems($physicalStoreId: String!, $queryString: String) {
    pagedStockItems(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      stockItems {
        _id
        itemTypeName
        itemTypeCompany
        itemTypeDetails
        itemTypePicture
        itemCategoryName
        unitOfMeasurement
        minStockLevel
        currentStockLevel
        totalStockLevel
      }
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
  WithPhysicalStoreId(),
  graphql(itemCategoriesListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ physicalStoreId, queryString }) => ({
      variables: { physicalStoreId, queryString },
    }),
  }),
  WithBreadcrumbs(["Inventory", "Stock Items", "List"])
)(List);
