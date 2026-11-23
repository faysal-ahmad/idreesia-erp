import React from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';

import { Permissions } from 'meteor/idreesia-common/constants';

import { default as paths } from '../submodule-paths';
import DocumentList from '../common/document-list';
import { formatDate, formatMoney } from '../common/format';
import StatusTag from '../common/status-tag';
import usePurchasingAccess from '../common/use-purchasing-access';
import { PAGED_PURCHASING_QUOTES } from './gql';

const QUOTE_STATUSES = ['received', 'selected', 'rejected'];

const List = (props: RouteComponentProps) => {
  const { can } = usePurchasingAccess();

  const columns = [
    {
      title: 'Vendor',
      key: 'vendor',
      render: (_: unknown, record: any) => (
        <Link to={paths.quoteEditPath(record._id)}>{record.vendor?.name ?? 'Quote'}</Link>
      ),
    },
    { title: 'Reference', dataIndex: 'reference', key: 'reference', width: 180 },
    { title: 'Quote Date', dataIndex: 'quoteDate', key: 'quoteDate', width: 140, render: formatDate },
    { title: 'Valid Until', dataIndex: 'validUntil', key: 'validUntil', width: 140, render: formatDate },
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
      width: 120,
      render: (status: string) => <StatusTag status={status} />,
    },
  ];

  return (
    <DocumentList
      {...props}
      breadcrumbs={['Purchasing', 'Quotes']}
      query={PAGED_PURCHASING_QUOTES}
      dataKey="pagedPurchasingQuotes"
      columns={columns}
      noun="quotes"
      searchPlaceholder="Search reference"
      statuses={QUOTE_STATUSES}
      showVendorFilter
      newButton={
        can(Permissions.PURCHASING_MANAGE_ORDERS)
          ? { label: 'New Quote', onClick: () => props.history.push(paths.quoteNewPath) }
          : undefined
      }
    />
  );
};

export default List;
