import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Avatar, Button, Pagination, Table } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { toSafeInteger } from "lodash";

import { WithBreadcrumbs, WithQueryParams } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";

import ListFilter from "./list-filter";

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

const NameDivStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "flex-start",
  alignItems: "center",
  width: "100%",
};

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,

    loading: PropTypes.bool,
    pagedItemTypes: PropTypes.shape({
      totalResults: PropTypes.number,
      itemTypes: PropTypes.array,
    }),
    allItemCategories: PropTypes.array,
  };

  columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        if (record.imageId) {
          const url = `${Meteor.settings.public.graphqlServerUrl}/download-file?attachmentId=${
            record.imageId
          }`;
          return (
            <div style={NameDivStyle}>
              <Avatar shape="square" size="large" src={url} />
              &nbsp;&nbsp;
              <Link to={`${paths.itemTypesPath}/${record._id}`}>{text}</Link>
            </div>
          );
        }

        return (
          <div style={NameDivStyle}>
            <Avatar shape="square" size="large" icon="picture" />
            &nbsp;
            <Link to={`${paths.itemTypesPath}/${record._id}`}>{text}</Link>
          </div>
        );
      },
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "Details",
      dataIndex: "details",
      key: "details",
    },
    {
      title: "Measurement Unit",
      dataIndex: "formattedUOM",
      key: "formattedUOM",
    },
    {
      title: "Category",
      dataIndex: "itemCategoryName",
      key: "itemCategoryName",
    },
  ];

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
    const { history } = this.props;
    history.push(paths.itemTypesNewFormPath);
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

  getTableHeader = () => {
    const { queryParams, allItemCategories } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button
          type="primary"
          icon="plus-circle-o"
          onClick={this.handleNewClicked}
        >
          New Item Type
        </Button>
        <ListFilter
          refreshPage={this.refreshPage}
          queryParams={queryParams}
          allItemCategories={allItemCategories}
        />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      queryParams: { pageIndex, pageSize },
      pagedItemTypes: { totalResults, itemTypes },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 10;

    return (
      <Table
        rowKey="_id"
        dataSource={itemTypes}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
        size="small"
        pagination={false}
        footer={() => (
          <Pagination
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
  query pagedItemTypes($queryString: String) {
    pagedItemTypes(queryString: $queryString) {
      totalResults
      itemTypes {
        _id
        name
        urduName
        company
        details
        formattedUOM
        itemCategoryName
        imageId
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
  graphql(itemCategoriesListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ queryString }) => ({ variables: { queryString } }),
  }),
  WithBreadcrumbs(["Inventory", "Setup", "Item Types", "List"])
)(List);
