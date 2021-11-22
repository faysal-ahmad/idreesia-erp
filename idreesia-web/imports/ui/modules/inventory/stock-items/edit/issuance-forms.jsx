import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { FileOutlined, EditOutlined } from '@ant-design/icons';

import { find, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Table, Tooltip } from 'antd';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    stockItemId: PropTypes.string,
    loading: PropTypes.bool,
    issuanceFormsByStockItem: PropTypes.array,
  };

  columns = [
    {
      title: 'Issue Date',
      dataIndex: 'issueDate',
      key: 'issueDate',
      render: text => {
        const date = moment(Number(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Issued To',
      dataIndex: 'refIssuedTo.name',
      key: 'refIssuedTo.name',
    },
    {
      title: 'For Location',
      dataIndex: 'refLocation.name',
      key: 'refLocation.name',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: items => {
        const { stockItemId } = this.props;
        const item = find(items, _item => _item.stockItemId === stockItemId);
        return `${item.stockItemName} [${item.quantity} ${
          item.isInflow ? 'Returned' : 'Issued'
        }]`;
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (text, record) => {
        let tooltipTitle;
        let icon;

        if (!record.approvedOn) {
          tooltipTitle = 'Edit';
          icon = (
            <EditOutlined
              className="list-actions-icon"
              onClick={() => {
                this.handleEditClicked(record);
              }}
            />
          );
        } else {
          tooltipTitle = 'View';
          icon = (
            <FileOutlined
              className="list-actions-icon"
              onClick={() => {
                this.handleViewClicked(record);
              }}
            />
          );
        }

        return (
          <div className="list-actions-column">
            <Tooltip title={tooltipTitle}>
              {icon}
            </Tooltip>
          </div>
        );
      },
    },
  ];

  handleViewClicked = issuanceForm => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.issuanceFormsViewFormPath(physicalStoreId, issuanceForm._id)
    );
  };

  handleEditClicked = issuanceForm => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.issuanceFormsEditFormPath(physicalStoreId, issuanceForm._id)
    );
  };

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
  query issuanceFormsByStockItem(
    $physicalStoreId: String!
    $stockItemId: String!
  ) {
    issuanceFormsByStockItem(
      physicalStoreId: $physicalStoreId
      stockItemId: $stockItemId
    ) {
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
        stockItemName
      }
      refIssuedTo {
        _id
        name
      }
      refLocation {
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
