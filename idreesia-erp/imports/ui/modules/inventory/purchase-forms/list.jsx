import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Icon, Pagination, Table, Tooltip, message } from "antd";
import moment from "moment";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { toSafeInteger } from "lodash";

import { Formats } from "meteor/idreesia-common/constants";
import { WithBreadcrumbs, WithQueryParams } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import { WithPhysicalStoreId } from "/imports/ui/modules/inventory/common/composers";

import ListFilter from "./list-filter";

const ToolbarStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
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
    history: PropTypes.object,
    location: PropTypes.object,

    queryString: PropTypes.string,
    queryParams: PropTypes.object,
    physicalStoreId: PropTypes.string,

    loading: PropTypes.bool,
    pagedPurchaseForms: PropTypes.shape({
      totalResults: PropTypes.number,
      purchaseForms: PropTypes.array,
    }),
    removePurchaseForm: PropTypes.func,
    approvePurchaseForm: PropTypes.func,
  };

  columns = [
    {
      title: "Approved",
      dataIndex: "approvedOn",
      key: "approvedOn",
      render: text => {
        if (text) return <Icon type="check" />;
        return null;
      },
    },
    {
      title: "Purchase Date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      render: text => {
        const date = moment(new Date(text));
        return date.format("DD MMM, YYYY");
      },
    },
    {
      title: "Purchased By",
      dataIndex: "purchasedByName",
      key: "purchasedByName",
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: items => {
        const formattedItems = items.map(item => (
          <li key={`${item.stockItemId}${item.isInflow}`}>
            {`${item.itemTypeName} [${item.quantity} ${
              item.isInflow ? "Purchased" : "Returned"
            }]`}
          </li>
        ));
        return <ul>{formattedItems}</ul>;
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (text, record) => {
        if (!record.approvedOn) {
          return (
            <div style={ActionsStyle}>
              <Tooltip title="Approve">
                <Icon
                  type="check-square-o"
                  style={IconStyle}
                  onClick={() => {
                    this.handleApproveClicked(record);
                  }}
                />
              </Tooltip>
              <Tooltip title="Edit">
                <Icon
                  type="edit"
                  style={IconStyle}
                  onClick={() => {
                    this.handleEditClicked(record);
                  }}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <Icon
                  type="delete"
                  style={IconStyle}
                  onClick={() => {
                    this.handleDeleteClicked(record);
                  }}
                />
              </Tooltip>
            </div>
          );
        }

        return (
          <Tooltip title="View">
            <Icon
              type="file"
              style={IconStyle}
              onClick={() => {
                this.handleViewClicked(record);
              }}
            />
          </Tooltip>
        );
      },
    },
  ];

  refreshPage = newParams => {
    const {
      approvalStatus,
      startDate,
      endDate,
      pageIndex,
      pageSize,
    } = newParams;
    const { queryParams, history, location } = this.props;

    let showApprovedVal;
    let showUnapprovedVal;
    if (newParams.hasOwnProperty("approvalStatus")) {
      showApprovedVal =
        approvalStatus.indexOf("approved") !== -1 ? "true" : "false";
      showUnapprovedVal =
        approvalStatus.indexOf("unapproved") !== -1 ? "true" : "false";
    } else {
      showApprovedVal = queryParams.showApproved || "true";
      showUnapprovedVal = queryParams.showUnapproved || "true";
    }

    let startDateVal;
    if (newParams.hasOwnProperty("startDate"))
      startDateVal = startDate ? startDate.format(Formats.DATE_FORMAT) : "";
    else startDateVal = queryParams.startDateVal || "";

    let endDateVal;
    if (newParams.hasOwnProperty("endDate"))
      endDateVal = endDate ? endDate.format(Formats.DATE_FORMAT) : "";
    else endDateVal = queryParams.endDateVal || "";

    let pageIndexVal;
    if (newParams.hasOwnProperty("pageIndex")) pageIndexVal = pageIndex || 0;
    else pageIndexVal = queryParams.pageIndex || 0;

    let pageSizeVal;
    if (newParams.hasOwnProperty("pageSize")) pageSizeVal = pageSize || 10;
    else pageSizeVal = queryParams.pageSize || 10;

    const path = `${
      location.pathname
    }?showApproved=${showApprovedVal}&showUnapproved=${showUnapprovedVal}&startDate=${startDateVal}&endDate=${endDateVal}&pageIndex=${pageIndexVal}&pageSize=${pageSizeVal}`;
    history.push(path);
  };

  handleNewClicked = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.purchaseFormsNewFormPath(physicalStoreId));
  };

  handleEditClicked = record => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.purchaseFormsEditFormPath(physicalStoreId, record._id));
  };

  handleViewClicked = record => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.purchaseFormsViewFormPath(physicalStoreId, record._id));
  };

  handleDeleteClicked = purchaseForm => {
    const { removePurchaseForm } = this.props;
    removePurchaseForm({
      variables: { _id: purchaseForm._id },
    })
      .then(() => {
        message.success("Purchase form has been deleted.", 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  handleApproveClicked = purchaseForm => {
    const { approvePurchaseForm } = this.props;
    approvePurchaseForm({
      variables: { _id: purchaseForm._id },
    })
      .then(() => {
        message.success("Purchase form has been approved.", 5);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
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
    const { queryParams } = this.props;

    return (
      <div style={ToolbarStyle}>
        <Button
          type="primary"
          icon="plus-circle-o"
          onClick={this.handleNewClicked}
        >
          New Purchase Form
        </Button>
        <ListFilter refreshPage={this.refreshPage} queryParams={queryParams} />
      </div>
    );
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      queryParams: { pageIndex, pageSize },
      pagedPurchaseForms: { totalResults, purchaseForms },
    } = this.props;

    const numPageIndex = pageIndex ? toSafeInteger(pageIndex) + 1 : 1;
    const numPageSize = pageSize ? toSafeInteger(pageSize) : 10;

    return (
      <Table
        rowKey="_id"
        dataSource={purchaseForms}
        columns={this.columns}
        bordered
        title={this.getTableHeader}
        size="small"
        pagination={false}
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

const formMutationRemove = gql`
  mutation removePurchaseForm($_id: String!) {
    removePurchaseForm(_id: $_id)
  }
`;

const formMutationApprove = gql`
  mutation approvePurchaseForm($_id: String!) {
    approvePurchaseForm(_id: $_id) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
        itemTypeName
      }
    }
  }
`;

const listQuery = gql`
  query pagedPurchaseForms($physicalStoreId: String!, $queryString: String) {
    pagedPurchaseForms(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      purchaseForms {
        _id
        purchaseDate
        receivedBy
        purchasedBy
        physicalStoreId
        approvedOn
        items {
          stockItemId
          quantity
          isInflow
          itemTypeName
        }
        refReceivedBy {
          _id
          name
        }
        refPurchasedBy {
          _id
          name
        }
      }
    }
  }
`;

export default compose(
  WithQueryParams(),
  WithPhysicalStoreId(),
  graphql(formMutationRemove, {
    name: "removePurchaseForm",
    options: {
      refetchQueries: [
        "pagedPurchaseForms",
        "purchaseFormsByStockItem",
        "pagedStockItems",
      ],
    },
  }),
  graphql(formMutationApprove, {
    name: "approvePurchaseForm",
    options: {
      refetchQueries: [
        "pagedPurchaseForms",
        "purchaseFormsByStockItem",
        "pagedStockItems",
      ],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ physicalStoreId, queryString }) => ({
      variables: { physicalStoreId, queryString },
    }),
  }),
  WithBreadcrumbs(["Inventory", "Forms", "Purchase Forms", "List"])
)(List);
