import React from 'react';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Table, Tooltip } from 'antd';
import { FileOutlined, EditOutlined } from '@ant-design/icons';
import { type History } from 'history';

import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import type {
  StockAdjustmentsByStockItemQuery,
  StockAdjustmentsByStockItemQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

type AdjustmentRow = NonNullable<
  NonNullable<
    StockAdjustmentsByStockItemQuery['stockAdjustmentsByStockItem']
  >[number]
>;

interface Props {
  history: History;
  physicalStoreId: string;
  stockItemId: string;
}

const STOCK_ADJUSTMENTS_BY_STOCK_ITEM: TypedDocumentNode<
  StockAdjustmentsByStockItemQuery,
  StockAdjustmentsByStockItemQueryVariables
> = gql`
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

const Adjustments = ({ history, physicalStoreId, stockItemId }: Props) => {
  const { data, loading } = useQuery(STOCK_ADJUSTMENTS_BY_STOCK_ITEM, {
    variables: { physicalStoreId, stockItemId },
    skip: !physicalStoreId || !stockItemId,
  });

  const handleViewClicked = (adjustment: AdjustmentRow) => {
    if (!adjustment._id) return;
    history.push(
      paths.stockAdjustmentsViewFormPath(physicalStoreId, adjustment._id)
    );
  };

  const handleEditClicked = (adjustment: AdjustmentRow) => {
    if (!adjustment._id) return;
    history.push(
      paths.stockAdjustmentsEditFormPath(physicalStoreId, adjustment._id)
    );
  };

  const columns: any[] = [
    {
      title: 'Adjustment',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text: number, record: AdjustmentRow) => {
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
      render: (_text: unknown, record: AdjustmentRow) => {
        let tooltipTitle;
        let icon;

        if (!record.approvedOn) {
          tooltipTitle = 'Edit';
          icon = (
            <EditOutlined
              className="list-actions-icon"
              onClick={() => {
                handleEditClicked(record);
              }}
            />
          );
        } else {
          tooltipTitle = 'View';
          icon = (
            <FileOutlined
              className="list-actions-icon"
              onClick={() => {
                handleViewClicked(record);
              }}
            />
          );
        }

        return (
          <div className="list-actions-column">
            <Tooltip title={tooltipTitle}>{icon}</Tooltip>
          </div>
        );
      },
    },
  ];

  if (loading) return null;

  const stockAdjustmentsByStockItem = (
    data?.stockAdjustmentsByStockItem ?? []
  ).filter((row): row is AdjustmentRow => row != null);

  return (
    <Table
      rowKey="_id"
      dataSource={stockAdjustmentsByStockItem}
      columns={columns}
      bordered
    />
  );
};

export default Adjustments;
