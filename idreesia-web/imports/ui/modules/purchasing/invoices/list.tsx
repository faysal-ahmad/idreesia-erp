import React from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { Tag } from 'antd';
import dayjs from 'dayjs';

import { Permissions } from 'meteor/idreesia-common/constants';

import { default as paths } from '../submodule-paths';
import DocumentList from '../common/document-list';
import { formatDate, formatMoney, toDayjs } from '../common/format';
import StatusTag from '../common/status-tag';
import usePurchasingAccess from '../common/use-purchasing-access';
import { PAGED_PURCHASING_INVOICES } from './gql';

export const INVOICE_STATUSES = ['unpaid', 'partially-paid', 'paid', 'voided'];

const List = (props: RouteComponentProps) => {
  const { can } = usePurchasingAccess();

  const columns = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      width: 150,
      render: (text: string, record: { _id: string }) => (
        <Link to={paths.invoiceViewPath(record._id)}>{text}</Link>
      ),
    },
    { title: 'Vendor Invoice', dataIndex: 'vendorInvoiceNo', key: 'vendorInvoiceNo', width: 160 },
    { title: 'Vendor', key: 'vendor', render: (_: unknown, record: any) => record.vendor?.name ?? '' },
    {
      title: 'Orders',
      key: 'orders',
      width: 180,
      render: (_: unknown, record: any) =>
        (record.orders ?? []).filter((o: any) => o?._id).map((o: any, index: number) => (
          <React.Fragment key={o._id}>
            {index > 0 ? ', ' : null}
            <Link to={paths.orderEditPath(o._id)}>{o.number}</Link>
          </React.Fragment>
        )),
    },
    { title: 'Date', dataIndex: 'invoiceDate', key: 'invoiceDate', width: 130, render: formatDate },
    {
      title: 'Due',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
      render: (value: string, record: any) => {
        const overdue =
          ['unpaid', 'partially-paid'].includes(record.status) && toDayjs(value)?.isBefore(dayjs());
        return <span style={overdue ? { color: '#b42318' } : undefined}>{formatDate(value)}</span>;
      },
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 130,
      align: 'right' as const,
      render: formatMoney,
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      width: 130,
      align: 'right' as const,
      render: formatMoney,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 170,
      render: (status: string, record: any) => (
        <>
          <StatusTag status={status} />
          {record.isDisputed ? <Tag color="error">Disputed</Tag> : null}
        </>
      ),
    },
  ];

  return (
    <DocumentList
      {...props}
      breadcrumbs={['Purchasing', 'Invoices']}
      query={PAGED_PURCHASING_INVOICES}
      dataKey="pagedPurchasingInvoices"
      columns={columns}
      noun="invoices"
      searchPlaceholder="Search number or vendor invoice"
      statuses={INVOICE_STATUSES}
      showVendorFilter
      showDateRange
      toggle={{ name: 'overdue', label: 'Overdue only' }}
      newButton={
        can(Permissions.PURCHASING_MANAGE_INVOICES)
          ? { label: 'New Invoice', onClick: () => props.history.push(paths.invoiceNewPath) }
          : undefined
      }
    />
  );
};

export default List;
