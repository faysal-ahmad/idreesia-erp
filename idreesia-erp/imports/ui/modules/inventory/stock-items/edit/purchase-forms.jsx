import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Icon, Table, Tooltip } from 'antd';
import moment from 'moment';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

const ActionsStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const IconStyle = {
  cursor: 'pointer',
};

class List extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    purchaseFormsByStockItem: PropTypes.array,
  };

  columns = [
    {
      title: 'Approved',
      dataIndex: 'approvedOn',
      key: 'approvedOn',
      render: text => {
        let value = false;
        if (text) value = true;
        return <Checkbox checked={value} disabled />;
      },
    },
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: text => {
        const date = moment(new Date(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Purchased By',
      dataIndex: 'purchasedByName',
      key: 'purchasedByName',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: items => {
        const formattedItems = items.map(item => `${item.itemTypeName} - ${item.quantity}`);
        return formattedItems.join(', ');
      },
    },
    {
      title: 'Actions',
      key: 'action',
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
    const { loading, purchaseFormsByStockItem } = this.props;
    if (loading) return null;

    return (
      <Table rowKey="_id" dataSource={purchaseFormsByStockItem} columns={this.columns} bordered />
    );
  }
}

const listQuery = gql`
  query purchaseFormsByStockItem($stockItemId: String) {
    purchaseFormsByStockItem(stockItemId: $stockItemId) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      receivedByName
      purchasedByName
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        itemTypeName
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
