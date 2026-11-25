import React, { useState } from 'react';
import { Button, InputNumber, Space, Table } from 'antd';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { message } from '/imports/ui/antd-feedback';
import StockItemInput from '/imports/ui/modules/stores/stock-items/field/input';
import { formatQuantity } from './format';

export interface RequisitionLineValue {
  /** Kept for lines that were already saved, so later documents can refer to them. */
  _id?: string;
  /** The store's stock item. */
  externalCatalogId: string;
  description: string;
  unit: string;
  quantity: number;
}

interface PickedStockItem {
  _id?: string | null;
  name?: string | null;
  formattedName?: string | null;
  unitOfMeasurement?: string | null;
}

interface Props {
  value?: RequisitionLineValue[];
  onChange?(lines: RequisitionLineValue[]): void;
  physicalStoreId: string;
  readOnly?: boolean;
}

/**
 * The lines of a store requisition: each one is a stock item of the store and
 * the quantity wanted. Used as the value control of a Form.Item.
 */
const LinesEditor = ({ value = [], onChange, physicalStoreId, readOnly }: Props) => {
  const [picked, setPicked] = useState<PickedStockItem | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);

  const handleAdd = () => {
    if (!picked?._id || !quantity || quantity <= 0) {
      message.info('Select a stock item and enter the quantity wanted.', 5);
      return;
    }
    const stockItemId = picked._id;
    const existing = value.find(line => line.externalCatalogId === stockItemId);
    if (existing) {
      onChange?.(
        value.map(line =>
          line === existing
            ? { ...line, quantity: line.quantity + quantity }
            : line
        )
      );
    } else {
      onChange?.([
        ...value,
        {
          externalCatalogId: stockItemId,
          description: picked.formattedName ?? picked.name ?? '',
          unit: picked.unitOfMeasurement ?? '',
          quantity,
        },
      ]);
    }
    setPicked(null);
    setQuantity(null);
  };

  const columns = [
    { title: 'Item', dataIndex: 'description', key: 'description' },
    { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 90 },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 140,
      render: (_text: number, record: RequisitionLineValue) =>
        readOnly ? (
          formatQuantity(record.quantity)
        ) : (
          <InputNumber
            min={0}
            precision={2}
            value={record.quantity}
            onChange={next =>
              onChange?.(
                value.map(line =>
                  line === record ? { ...line, quantity: Number(next ?? 0) } : line
                )
              )
            }
          />
        ),
    },
    ...(readOnly
      ? []
      : [
          {
            title: '',
            key: 'remove',
            width: 60,
            render: (_text: unknown, record: RequisitionLineValue) => (
              <DeleteOutlined
                className="list-actions-icon"
                onClick={() => onChange?.(value.filter(line => line !== record))}
              />
            ),
          },
        ]),
  ];

  return (
    <div>
      {readOnly ? null : (
        <Space style={{ marginBottom: 12 }} wrap>
          <div style={{ width: 320 }}>
            <StockItemInput
              physicalStoreId={physicalStoreId}
              placeholder="Stock Item"
              value={picked as never}
              onChange={item => setPicked(item as PickedStockItem)}
            />
          </div>
          <InputNumber
            min={0}
            precision={2}
            placeholder="Quantity"
            value={quantity}
            onChange={next => setQuantity(next)}
          />
          <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleAdd}>
            Add Item
          </Button>
        </Space>
      )}
      <Table
        size="small"
        bordered
        rowKey={(record: RequisitionLineValue) => record._id ?? record.externalCatalogId}
        dataSource={value}
        columns={columns}
        pagination={false}
        locale={{ emptyText: 'No items yet' }}
      />
    </div>
  );
};

export default LinesEditor;
