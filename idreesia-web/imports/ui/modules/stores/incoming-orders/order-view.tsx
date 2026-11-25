import React from 'react';
import { useQuery } from '@apollo/client/react';
import { type RouteComponentProps } from 'react-router';
import { useParams } from 'react-router-dom';
import { Button, Descriptions, Empty, Space, Spin, Table } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

import { Permissions, ModuleNames } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import {
  usePhysicalStore,
  useStorePermissions,
} from '/imports/ui/modules/stores/common/hooks';
import StatusTag from '../common/purchasing/status-tag';
import { formatDate, formatQuantity } from '../common/purchasing/format';
import { STORE_ORDER_BY_ID } from './gql';

const RECEIVABLE = ['approved', 'sent', 'partially-received'];

type RouteParams = { physicalStoreId: string; orderId: string };

/** A purchase order raised from the store's requisition: what was ordered and what has arrived. */
const OrderView = ({ history }: RouteComponentProps<RouteParams>) => {
  const { physicalStoreId, orderId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { can } = useStorePermissions(physicalStoreId);
  const { data, loading } = useQuery(STORE_ORDER_BY_ID, {
    variables: { physicalStoreId, _id: orderId },
    fetchPolicy: 'cache-and-network',
  });
  const order = data?.storeOrderById;

  useDynamicBreadcrumbs([
    ModuleNames.stores,
    physicalStore?.name ?? '',
    'Incoming Orders',
    order?.number ?? '',
  ]);

  if (loading && !order) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!order?._id) {
    return <Empty description="Order not found" style={{ padding: '80px 0' }} />;
  }

  const lines = (order.lines ?? []).filter((line): line is NonNullable<typeof line> => line != null);
  const canReceive = can(Permissions.IN_MANAGE_RECEIPTS) && RECEIVABLE.includes(order.status ?? '');

  return (
    <div style={{ maxWidth: 900 }}>
      <Space style={{ marginBottom: 12 }} wrap>
        <StatusTag status={order.status} />
        {canReceive ? (
          <Button
            type="primary"
            icon={<InboxOutlined />}
            onClick={() => history.push(paths.goodsReceiptsNewFormPath(physicalStoreId, orderId))}
          >
            Receive Goods
          </Button>
        ) : null}
        <Button onClick={() => history.push(paths.incomingOrdersPath(physicalStoreId))}>
          Back to List
        </Button>
      </Space>
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Order">{order.number}</Descriptions.Item>
        <Descriptions.Item label="Requisition">{order.requisitionNumber}</Descriptions.Item>
        <Descriptions.Item label="Vendor">{order.vendorName}</Descriptions.Item>
        <Descriptions.Item label="Order Date">{formatDate(order.orderDate)}</Descriptions.Item>
        <Descriptions.Item label="Expected Delivery">
          {formatDate(order.expectedDeliveryDate)}
        </Descriptions.Item>
      </Descriptions>
      <Table
        size="small"
        bordered
        rowKey="_id"
        pagination={false}
        dataSource={lines}
        columns={[
          { title: 'Item', dataIndex: 'description', key: 'description' },
          { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 90 },
          {
            title: 'Ordered',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 110,
            render: (value: number) => formatQuantity(value),
          },
          {
            title: 'Received',
            dataIndex: 'receivedQuantity',
            key: 'receivedQuantity',
            width: 110,
            render: (value: number) => formatQuantity(value),
          },
          {
            title: 'Still Due',
            key: 'due',
            width: 110,
            render: (_text: unknown, record: (typeof lines)[number]) =>
              formatQuantity(Math.max(0, (record.quantity ?? 0) - (record.receivedQuantity ?? 0))),
          },
        ]}
      />
    </div>
  );
};

export default OrderView;
