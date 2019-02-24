import React, { Component } from "react";
import PropTypes from "prop-types";
import { Icon, Table, Tooltip } from "antd";
import moment from "moment";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

const ActionsStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
};

const IconStyle = {
  cursor: "pointer",
};

class List extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    stockAdjustmentsByStockItem: PropTypes.array,
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
      title: "Adjustment",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => {
        if (record.isInflow) {
          return `Increased by ${text}`;
        }
        return `Decreased by ${text}`;
      },
    },
    {
      title: "Adjustment Date",
      dataIndex: "adjustmentDate",
      key: "adjustmentDate",
      render: text => {
        const date = moment(Number(text));
        return date.format("DD MMM, YYYY");
      },
    },
    {
      title: "Adjusted By",
      dataIndex: "refAdjustedBy.name",
      key: "adjustedBy",
    },
    {
      title: "Adjusted Reason",
      dataIndex: "adjustmentReason",
      key: "adjustmentReason",
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
            </div>
          );
        }

        return null;
      },
    },
  ];

  handleApproveClicked = () => {};

  render() {
    const { loading, stockAdjustmentsByStockItem } = this.props;
    if (loading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={stockAdjustmentsByStockItem}
        columns={this.columns}
        bordered
      />
    );
  }
}

const listQuery = gql`
  query stockAdjustmentsByStockItem($stockItemId: String) {
    stockAdjustmentsByStockItem(stockItemId: $stockItemId) {
      _id
      physicalStoreId
      stockItemId
      adjustmentDate
      adjustedBy
      quantity
      isInflow
      adjustmentReason
      approvedOn
      refStockItem {
        _id
        itemTypeFormattedName
        itemTypeImageId
      }
      refAdjustedBy {
        _id
        name
      }
    }
  }
`;

export default compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ stockItemId }) => ({ variables: { stockItemId } }),
  })
)(List);
