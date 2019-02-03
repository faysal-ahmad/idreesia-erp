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
    issuanceFormsByStockItem: PropTypes.array,
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
      title: "Issue Date",
      dataIndex: "issueDate",
      key: "issueDate",
      render: text => {
        const date = moment(new Date(text));
        return date.format("DD MMM, YYYY");
      },
    },
    {
      title: "Issued To",
      dataIndex: "refIssuedTo.name",
      key: "refIssuedTo.name",
    },
    {
      title: "Items",
      dataIndex: "items",
      key: "items",
      render: items => {
        const formattedItems = items.map(item => (
          <li key={`${item.stockItemId}${item.isInflow}`}>
            {`${item.itemTypeName} [${item.quantity} ${
              item.isInflow ? "Returned" : "Issued"
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
            </div>
          );
        }

        return null;
      },
    },
  ];

  handleApproveClicked = () => {};

  render() {
    const { loading, issuanceFormsByStockItem } = this.props;
    if (loading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={issuanceFormsByStockItem}
        columns={this.columns}
        bordered
      />
    );
  }
}

const listQuery = gql`
  query issuanceFormsByStockItem($stockItemId: String) {
    issuanceFormsByStockItem(stockItemId: $stockItemId) {
      _id
      issueDate
      issuedBy
      issuedTo
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
        itemTypeName
      }
      refIssuedBy {
        _id
        name
      }
      refIssuedTo {
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
