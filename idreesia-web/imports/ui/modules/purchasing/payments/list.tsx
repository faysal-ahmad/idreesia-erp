import React from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';

import { Permissions } from 'meteor/idreesia-common/constants';

import { default as paths } from '../submodule-paths';
import DocumentList from '../common/document-list';
import { formatDate, formatMoney } from '../common/format';
import StatusTag from '../common/status-tag';
import usePurchasingAccess from '../common/use-purchasing-access';
import { PAGED_PURCHASING_PAYMENTS } from './gql';

export const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  'bank-transfer': 'Bank Transfer',
  cheque: 'Cheque',
};

const List = (props: RouteComponentProps) => {
  const { can } = usePurchasingAccess();

  const columns = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      width: 150,
      render: (text: string, record: { _id: string }) => (
        <Link to={paths.paymentViewPath(record._id)}>{text}</Link>
      ),
    },
    { title: 'Vendor', key: 'vendor', render: (_: unknown, record: any) => record.vendor?.name ?? '' },
    { title: 'Date', dataIndex: 'paymentDate', key: 'paymentDate', width: 130, render: formatDate },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      width: 140,
      render: (method: string) => METHOD_LABELS[method] ?? method,
    },
    { title: 'Reference', dataIndex: 'reference', key: 'reference', width: 170 },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right' as const,
      render: formatMoney,
    },
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
      breadcrumbs={['Purchasing', 'Payments']}
      query={PAGED_PURCHASING_PAYMENTS}
      dataKey="pagedPurchasingPayments"
      columns={columns}
      noun="payments"
      searchPlaceholder="Search number or reference"
      statuses={['posted', 'voided']}
      showVendorFilter
      showDateRange
      newButton={
        can(Permissions.PURCHASING_MANAGE_PAYMENTS)
          ? { label: 'New Payment', onClick: () => props.history.push(paths.paymentNewPath) }
          : undefined
      }
    />
  );
};

export default List;
