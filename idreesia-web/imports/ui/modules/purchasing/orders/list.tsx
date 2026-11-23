import React from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';

import { Permissions } from 'meteor/idreesia-common/constants';

import { default as paths } from '../submodule-paths';
import DocumentList from '../common/document-list';
import { formatDate, formatMoney } from '../common/format';
import StatusTag from '../common/status-tag';
import usePurchasingAccess from '../common/use-purchasing-access';
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
  const { can } = usePurchasingAccess();

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
      showDateRange
      newButton={
        can(Permissions.PURCHASING_MANAGE_ORDERS)
          ? { label: 'New Order', onClick: () => props.history.push(paths.orderNewPath) }
          : undefined
      }
    />
  );
};

export default List;
