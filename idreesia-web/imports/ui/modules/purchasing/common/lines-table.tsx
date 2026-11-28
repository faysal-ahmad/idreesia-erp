import React from 'react';
import { Table, Tooltip, Typography } from 'antd';

import { formatMoney, formatQuantity } from './format';
import { differsFromOrder } from './line-items-editor';

/** The order line an invoice line bills: its price and tax rate. */
export interface OrderLinePrice {
  unitPrice?: number | null;
  taxRate?: number | null;
}

/** A value shown in amber, with the order's value, when it differs from it. */
const compared = (text: React.ReactNode, differs: boolean, orderText: string) =>
  differs ? (
    <Tooltip title={`Differs from the purchase order (${orderText})`}>
      <Typography.Text type="warning">{text}</Typography.Text>
    </Tooltip>
  ) : (
    text
  );

interface Line {
  _id?: string | null;
  orderLineId?: string | null;
  description?: string | null;
  unit?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  estimatedUnitPrice?: number | null;
  taxRate?: number | null;
  receivedQuantity?: number | null;
  invoicedQuantity?: number | null;
}

interface LinesTableProps {
  lines?: (Line | null)[] | null;
  /** Show the price column, and which price it is. */
  price?: 'unitPrice' | 'estimatedUnitPrice';
  showTax?: boolean;
  /** Order lines: show how much was received and invoiced. */
  showProgress?: boolean;
  /** Invoice lines: the order lines they bill, by id, to flag a different price or tax rate. */
  orderLines?: Map<string, OrderLinePrice>;
}

/** The lines of a document, read-only. */
const LinesTable = ({ lines, price, showTax, showProgress, orderLines }: LinesTableProps) => {
  const orderLineOf = (line: Line) => (line.orderLineId ? orderLines?.get(line.orderLineId) : undefined);
  const rows = (lines ?? []).filter((l): l is Line => l != null);
  const columns: any[] = [
    { title: 'Item', dataIndex: 'description', key: 'description' },
    { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 90 },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 110,
      align: 'right',
      render: formatQuantity,
    },
  ];
  if (showProgress) {
    columns.push(
      {
        title: 'Received',
        dataIndex: 'receivedQuantity',
        key: 'receivedQuantity',
        width: 110,
        align: 'right',
        render: formatQuantity,
      },
      {
        title: 'Invoiced',
        dataIndex: 'invoicedQuantity',
        key: 'invoicedQuantity',
        width: 110,
        align: 'right',
        render: formatQuantity,
      }
    );
  }
  if (price) {
    columns.push({
      title: price === 'unitPrice' ? 'Unit Price' : 'Est. Price',
      dataIndex: price,
      key: price,
      width: 130,
      align: 'right',
      render: (value: number | null | undefined, line: Line) => {
        const orderPrice = orderLineOf(line)?.unitPrice;
        return compared(formatMoney(value), differsFromOrder(value, orderPrice), formatMoney(orderPrice));
      },
    });
  }
  if (showTax) {
    columns.push({
      title: 'Tax %',
      dataIndex: 'taxRate',
      key: 'taxRate',
      width: 80,
      align: 'right',
      render: (rate: number | null | undefined, line: Line) => {
        const orderRate = orderLineOf(line)?.taxRate;
        return compared(rate ?? 0, differsFromOrder(rate, orderRate), `${orderRate ?? 0}%`);
      },
    });
  }
  if (price) {
    columns.push({
      title: 'Total',
      key: 'total',
      width: 130,
      align: 'right',
      render: (_: unknown, line: Line) =>
        formatMoney((line.quantity ?? 0) * (line[price] ?? 0)),
    });
  }

  return (
    <Table
      className="list-table"
      rowKey="_id"
      size="small"
      bordered
      pagination={false}
      dataSource={rows}
      columns={columns}
    />
  );
};

export default LinesTable;
