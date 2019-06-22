import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Avatar,
  Button,
  Icon,
  Table,
  Tooltip,
  Pagination,
  Popconfirm,
  message,
} from "antd";
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
  cursor: "pointer",
};

const ActionsStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

const IconStyle = {
  cursor: "pointer",
  fontSize: 20,
};

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    physicalStoreId: PropTypes.string,
    name: PropTypes.string,
    categoryId: PropTypes.string,
    setPageParams: PropTypes.func,
    handleItemSelected: PropTypes.func,
    showNewButton: PropTypes.bool,
    showActions: PropTypes.bool,
    handleNewClicked: PropTypes.func,
    removeStockItem: PropTypes.func,

    loading: PropTypes.bool,
    pagedStockItems: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  getColumns = () => {
    const { showActions } = this.props;
    const columns = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (text, record) => {
          const onClickHandler = () => {
            const { handleItemSelected } = this.props;
            handleItemSelected(record);
          };

          if (record.imageId) {
            const url = Meteor.absoluteUrl(
              `download-file?attachmentId=${record.imageId}`
            );
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
        dataIndex: "company",
        key: "company",
      },
      {
        title: "Details",
        dataIndex: "details",
        key: "details",
      },
      {
        title: "Category",
        dataIndex: "categoryName",
        key: "categoryName",
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

    if (showActions) {
      columns.push({
        title: "Actions",
        key: "action",
        render: (text, record) => {
          const {
            purchaseFormsCount,
            issuanceFormsCount,
            stockAdjustmentsCount,
          } = record;

          if (
            purchaseFormsCount + issuanceFormsCount + stockAdjustmentsCount ===
            0
          ) {
            return (
              <div style={ActionsStyle}>
                <Popconfirm
                  title="Are you sure you want to delete this stock item?"
                  onConfirm={() => {
                    this.handleDeleteClicked(record);
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Tooltip title="Delete">
                    <Icon type="delete" style={IconStyle} />
                  </Tooltip>
                </Popconfirm>
              </div>
            );
          }

          return null;
        },
      });
    }

    return columns;
  };

  handleDeleteClicked = stockItem => {
    const { removeStockItem } = this.props;
    removeStockItem({
      variables: {
        _id: stockItem._id,
        physicalStoreId: stockItem.physicalStoreId,
      },
    })
      .then(() => {
        message.success("Stock item has been deleted.", 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  onChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  getTableHeader = () => {
    const {
      name,
      categoryId,
      physicalStoreId,
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
          name={name}
          physicalStoreId={physicalStoreId}
          categoryId={categoryId}
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
      pagedStockItems: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 10;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.getColumns()}
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
      data {
        _id
        name
        formattedName
        company
        details
        imageId
        categoryName
        unitOfMeasurement
        minStockLevel
        currentStockLevel
        totalStockLevel
        purchaseFormsCount
        issuanceFormsCount
        stockAdjustmentsCount
      }
    }
  }
`;

const formMutationRemove = gql`
  mutation removeStockItem($_id: String!, $physicalStoreId: String!) {
    removeStockItem(_id: $_id, physicalStoreId: $physicalStoreId)
  }
`;

export default compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ physicalStoreId, categoryId, name, pageIndex, pageSize }) => ({
      variables: {
        physicalStoreId,
        queryString: `?categoryId=${categoryId || ""}&name=${name ||
          ""}&pageIndex=${pageIndex}&pageSize=${pageSize}`,
      },
    }),
  }),
  graphql(formMutationRemove, {
    name: "removeStockItem",
    options: {
      refetchQueries: ["pagedStockItems"],
    },
  })
)(List);
