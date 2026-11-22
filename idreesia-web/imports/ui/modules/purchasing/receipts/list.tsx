import React from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';

import { Permissions } from 'meteor/idreesia-common/constants';

import { default as paths } from '../submodule-paths';
import DocumentList from '../common/document-list';
import { formatDate } from '../common/format';
import StatusTag from '../common/status-tag';
import usePurchasingAccess from '../common/use-purchasing-access';
import { PAGED_PURCHASING_RECEIPTS } from './gql';

const List = (props: RouteComponentProps) => {
  const { can } = usePurchasingAccess();

  const columns = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      width: 150,
      render: (text: string, record: { _id: string }) => (
        <Link to={paths.receiptViewPath(record._id)}>{text}</Link>
      ),
    },
    {
      title: 'Order',
      key: 'order',
      width: 150,
      render: (_: unknown, record: any) =>
        record.order?._id ? <Link to={paths.orderEditPath(record.order._id)}>{record.order.number}</Link> : '',
    },
    { title: 'Vendor', key: 'vendor', render: (_: unknown, record: any) => record.vendor?.name ?? '' },
    { title: 'Received', dataIndex: 'receivedDate', key: 'receivedDate', width: 140, render: formatDate },
    { title: 'Delivery Note', dataIndex: 'deliveryNoteNo', key: 'deliveryNoteNo', width: 160 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => <StatusTag status={status} />,
    },
  ];

  return (
    <DocumentList
      {...props}
      breadcrumbs={['Purchasing', 'Goods Receipts']}
      query={PAGED_PURCHASING_RECEIPTS}
      dataKey="pagedPurchasingReceipts"
      columns={columns}
      noun="receipts"
      searchPlaceholder="Search number or delivery note"
      statuses={['posted', 'voided']}
      showVendorFilter
      newButton={
        can(Permissions.PURCHASING_MANAGE_RECEIPTS)
          ? { label: 'Receive Goods', onClick: () => props.history.push(paths.receiptNewPath) }
          : undefined
      }
    />
  );
};

export default List;
