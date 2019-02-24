import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Avatar, Button, Table, Pagination } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import ListFilter from "./list-filter";

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
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
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    physicalStoreId: PropTypes.string,
    itemCategoryId: PropTypes.string,
    itemTypeName: PropTypes.string,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    showNewButton: PropTypes.bool,
    handleNewClicked: PropTypes.func,

    loading: PropTypes.bool,
    pagedStockItems: PropTypes.shape({
      totalResults: PropTypes.number,
      stockItems: PropTypes.array,
    }),
  };

  columns = [
    {
      title: "Name",
      dataIndex: "itemTypeName",
      key: "itemTypeName",
      render: (text, record) => {
        const onClickHandler = () => {
          const { handleItemSelected } = this.props;
          handleItemSelected(record);
        };

        if (record.itemTypeImageId) {
          const url = Meteor.absoluteUrl(`download-file?attachmentId=${record.itemTypeImageId}`);
          return (
            <div style={NameDivStyle} onClick={onClickHandler}>
              <Avatar shape="square" size="large" src={url} />
              &nbsp;&nbsp;
              {text}
            </div>
          );
        }

        return (
          <div style={NameDivStyle} onClick={onClickHandler}>
            <Avatar shape="square" size="large" icon="picture" />
            &nbsp;&nbsp;
            {text}
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
    const {
      itemCategoryId,
      itemTypeName,
      setPageParams,
      showNewButton,
      handleNewClicked,
    } = this.props;

    let newButton = null;
    if (showNewButton) {
      newButton = (
        <Button type="primary" icon="plus-circle-o" onClick={handleNewClicked}>
          New Stock Item
        </Button>
      );
    }

    return (
      <div style={ToolbarStyle}>
        {newButton}
        <ListFilter
          itemCategoryId={itemCategoryId}
          itemTypeName={itemTypeName}
          setPageParams={setPageParams}
        />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      pagedStockItems: { totalResults, stockItems },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 10;

    return (
      <Table
        rowKey="_id"
        dataSource={stockItems}
        columns={this.columns}
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
        itemTypeImageId
        itemCategoryName
        unitOfMeasurement
        minStockLevel
        currentStockLevel
        totalStockLevel
      }
    }
  }
`;

export default compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({
      physicalStoreId,
      itemCategoryId,
      itemTypeName,
      pageIndex,
      pageSize,
    }) => ({
      variables: {
        physicalStoreId,
        queryString: `?itemCategoryId=${itemCategoryId ||
          ""}&itemTypeName=${itemTypeName ||
          ""}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
  })
)(List);
