import React from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';

import useReferencePhysicalStores from 'meteor/idreesia-common/hooks/reference-data/use-reference-physical-stores';

import { default as paths } from '../submodule-paths';
import DocumentList from '../common/document-list';
import { formatDate, formatMoney } from '../common/format';
import StatusTag from '../common/status-tag';
import { PAGED_PURCHASING_ORDERS } from './gql';

export const ORDER_STATUSES = [
  'draft',
  'pending-approval',
  'approved',
  'sent',
  'partially-received',
  'received',
  'closed',
  'cancelled',
];

const List = (props: RouteComponentProps) => {
  const { referencePhysicalStores } = useReferencePhysicalStores();
  const storeName = (id?: string | null) =>
    referencePhysicalStores?.find(store => store?._id === id)?.name ?? 'Store';
  const columns = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      width: 150,
      render: (text: string, record: { _id: string }) => (
        <Link to={paths.orderEditPath(record._id)}>{text}</Link>
      ),
    },
    {
      title: 'Vendor',
      key: 'vendor',
      render: (_: unknown, record: any) => record.vendor?.name ?? '',
    },
    { title: 'Order Date', dataIndex: 'orderDate', key: 'orderDate', width: 140, render: formatDate },
    {
      title: 'Expected Delivery',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDeliveryDate',
      width: 160,
      render: formatDate,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 140,
      align: 'right' as const,
      render: formatMoney,
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 110,
      render: (source: string, record: { externalSourceId?: string | null }) =>
        source === 'store' ? storeName(record.externalSourceId) : 'Purchasing',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: string) => <StatusTag status={status} />,
    },
  ];

  return (
    <DocumentList
      {...props}
      breadcrumbs={['Purchasing', 'Purchase Orders']}
      query={PAGED_PURCHASING_ORDERS}
      dataKey="pagedPurchasingOrders"
      columns={columns}
      noun="orders"
      searchPlaceholder="Search number"
      statuses={ORDER_STATUSES}
      showVendorFilter
      showSourceFilter
      showDateRange
    />
  );
};

export default List;
