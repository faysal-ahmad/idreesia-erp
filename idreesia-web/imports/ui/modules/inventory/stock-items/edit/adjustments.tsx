import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import { withQuery } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { Table, Tooltip } from 'antd';
import { FileOutlined, EditOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

const AntTable = Table as any;
const AntTooltip = Tooltip as any;
const AntFileOutlined = FileOutlined as any;
const AntEditOutlined = EditOutlined as any;

interface HistoryLike {
  push(path: string): void;
}

interface Adjustment {
  _id: string;
  adjustmentDate: string;
  quantity: number;
  isInflow: boolean;
  adjustmentReason?: string;
  approvedOn?: string;
}

interface ListProps {
  history: HistoryLike;
  physicalStoreId?: string;
  stockItemId?: string;
  loading?: boolean;
  stockAdjustmentsByStockItem?: Adjustment[];
}

class List extends Component<ListProps> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    loading: PropTypes.bool,
    stockAdjustmentsByStockItem: PropTypes.array,
  };

  columns: any[] = [
    {
      title: 'Adjustment',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text: number, record: Adjustment) => {
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
      render: (text: string) => dayjs(Number(text)).format('DD MMM, YYYY'),
    },
    {
      title: 'Adjusted By',
      dataIndex: ['refAdjustedBy', 'name'],
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
      render: (_text: unknown, record: Adjustment) => {
        let tooltipTitle;
        let icon;

        if (!record.approvedOn) {
          tooltipTitle = 'Edit';
          icon = (
            <AntEditOutlined
              className="list-actions-icon"
              onClick={() => {
                this.handleEditClicked(record);
              }}
            />
          );
        } else {
          tooltipTitle = 'View';
          icon = (
            <AntFileOutlined
              className="list-actions-icon"
              onClick={() => {
                this.handleViewClicked(record);
              }}
            />
          );
        }

        return (
          <div className="list-actions-column">
            <AntTooltip title={tooltipTitle}>{icon}</AntTooltip>
          </div>
        );
      },
    },
  ];

  handleViewClicked = (adjustment: Adjustment) => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.stockAdjustmentsViewFormPath(physicalStoreId, adjustment._id)
    );
  };

  handleEditClicked = (adjustment: Adjustment) => {
    const { history, physicalStoreId } = this.props;
    history.push(
      paths.stockAdjustmentsEditFormPath(physicalStoreId, adjustment._id)
    );
  };

  render() {
    const { loading, stockAdjustmentsByStockItem } = this.props;
    if (loading) return null;

    return (
      <AntTable
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
  withQuery(listQuery, {
    props: ({ data }: { data: Record<string, unknown> }) => ({ ...data }),
    options: ({
      physicalStoreId,
      stockItemId,
    }: {
      physicalStoreId?: string;
      stockItemId?: string;
    }) => ({
      variables: { physicalStoreId, stockItemId },
    }),
  })
)(List as any);
