import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { find, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Icon, Table, Tooltip } from '/imports/ui/controls';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    stockItemId: PropTypes.string,
    loading: PropTypes.bool,
    purchaseFormsByStockItem: PropTypes.array,
  };

  columns = [
    {
      title: 'Purchase Date',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      render: text => {
        const date = moment(Number(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Purchased By',
      dataIndex: 'refPurchasedBy.name',
      key: 'refPurchasedBy.name',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: items => {
        const { stockItemId } = this.props;
        const item = find(items, _item => _item.stockItemId === stockItemId);
        return `${item.stockItemName} [${item.quantity} ${
          item.isInflow ? 'Purchased' : 'Returned'
        }]`;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, record) => {
        let tooltipTitle;
        let iconType;
        let handler;

        if (!record.approvedOn) {
          tooltipTitle = 'Edit';
          iconType = 'edit';
          handler = this.handleEditClicked;
        } else {
          tooltipTitle = 'View';
          iconType = 'file';
          handler = this.handleViewClicked;
        }

        return (
          <div className="list-actions-column">
            <Tooltip title={tooltipTitle}>
              <Icon
                type={iconType}
                className="list-actions-icon"
                onClick={() => {
                  handler(record);
                }}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ];

  handleViewClicked = purchaseForm => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.purchaseFormsViewFormPath(physicalStoreId, purchaseForm._id)
    );
  };

  handleEditClicked = purchaseForm => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.purchaseFormsEditFormPath(physicalStoreId, purchaseForm._id)
    );
  };

  render() {
    const { loading, purchaseFormsByStockItem } = this.props;
    if (loading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={purchaseFormsByStockItem}
        columns={this.columns}
        bordered
      />
    );
  }
}

const listQuery = gql`
  query purchaseFormsByStockItem(
    $physicalStoreId: String!
    $stockItemId: String!
  ) {
    purchaseFormsByStockItem(
      physicalStoreId: $physicalStoreId
      stockItemId: $stockItemId
    ) {
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
        stockItemName
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
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ physicalStoreId, stockItemId }) => ({
      variables: { physicalStoreId, stockItemId },
    }),
  })
)(List);
