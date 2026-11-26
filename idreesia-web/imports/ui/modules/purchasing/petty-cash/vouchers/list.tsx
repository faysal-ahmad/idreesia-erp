import React from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';

import { Permissions } from 'meteor/idreesia-common/constants';

import DocumentList from '../../common/document-list';
import { formatDate, formatMoney } from '../../common/format';
import StatusTag from '../../common/status-tag';
import usePurchasingAccess from '../../common/use-purchasing-access';
import { default as paths } from '../../submodule-paths';
import { PAGED_PURCHASING_PETTY_CASH_VOUCHERS } from '../gql';

const List = (props: RouteComponentProps) => {
  const { can } = usePurchasingAccess();

  const columns = [
    {
      title: 'Number',
      dataIndex: 'number',
      key: 'number',
      width: 150,
      render: (text: string, record: { _id: string }) => (
        <Link to={paths.pettyCashVoucherViewPath(record._id)}>{text}</Link>
      ),
    },
    { title: 'Date', dataIndex: 'voucherDate', key: 'voucherDate', width: 120, render: formatDate },
    { title: 'Fund', key: 'fund', width: 200, render: (_: unknown, record: any) => record.fund?.name ?? '' },
    { title: 'Expense Head', key: 'expenseHead', width: 180, render: (_: unknown, record: any) => record.expenseHead?.name ?? '' },
    { title: 'Paid To', dataIndex: 'payee', key: 'payee', width: 200 },
    { title: 'Purpose', dataIndex: 'purpose', key: 'purpose' },
    { title: 'Total', dataIndex: 'total', key: 'total', width: 120, align: 'right' as const, render: formatMoney },
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
      breadcrumbs={['Purchasing', 'Petty Cash Vouchers']}
      query={PAGED_PURCHASING_PETTY_CASH_VOUCHERS}
      dataKey="pagedPurchasingPettyCashVouchers"
      columns={columns}
      noun="vouchers"
      searchPlaceholder="Search number, payee or purpose"
      statuses={['draft', 'submitted', 'approved', 'rejected', 'voided']}
      newButton={
        can(Permissions.PURCHASING_MANAGE_PETTY_CASH_VOUCHERS)
          ? { label: 'New Voucher', onClick: () => props.history.push(paths.pettyCashVoucherNewPath) }
          : undefined
      }
    />
  );
};

export default List;
