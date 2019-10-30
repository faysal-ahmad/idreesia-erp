import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Icon, Table, Tooltip } from '/imports/ui/controls';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    loading: PropTypes.bool,
    stockAdjustmentsByStockItem: PropTypes.array,
  };

  columns = [
    {
      title: 'Adjustment',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record) => {
        if (record.isInflow) {
          return `Increased by ${text}`;
        }
        return `Decreased by ${text}`;
      },
    },
    {
      title: 'Adjustment Date',
      dataIndex: 'adjustmentDate',
      key: 'adjustmentDate',
      render: text => {
        const date = moment(Number(text));
        return date.format('DD MMM, YYYY');
      },
    },
    {
      title: 'Adjusted By',
      dataIndex: 'refAdjustedBy.name',
      key: 'adjustedBy',
    },
    {
      title: 'Adjusted Reason',
      dataIndex: 'adjustmentReason',
      key: 'adjustmentReason',
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

  handleViewClicked = adjustment => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.stockAdjustmentsViewFormPath(physicalStoreId, adjustment._id)
    );
  };

  handleEditClicked = adjustment => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.stockAdjustmentsEditFormPath(physicalStoreId, adjustment._id)
    );
  };

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
  query stockAdjustmentsByStockItem(
    $physicalStoreId: String!
    $stockItemId: String!
  ) {
    stockAdjustmentsByStockItem(
      physicalStoreId: $physicalStoreId
      stockItemId: $stockItemId
    ) {
      _id
      physicalStoreId
      stockItemId
      adjustmentDate
      adjustedBy
      quantity
      isInflow
      adjustmentReason
      approvedOn
      refAdjustedBy {
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
