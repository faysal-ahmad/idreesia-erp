import React, { useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Descriptions, Empty, Popconfirm, Space, Spin, Table, Tabs } from 'antd';

import { Permissions } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import AttachmentsTab from '../../common/attachments-tab';
import HistoryTab from '../../common/history-tab';
import { formatDate, formatMoney, formatQuantity } from '../../common/format';
import ReasonModal from '../../common/reason-modal';
import { runAction } from '../../common/run-action';
import StatusTag from '../../common/status-tag';
import usePurchasingAccess from '../../common/use-purchasing-access';
import { default as paths } from '../../submodule-paths';
import {
  APPROVE_PURCHASING_PETTY_CASH_VOUCHER,
  DELETE_PURCHASING_PETTY_CASH_VOUCHER,
  PURCHASING_PETTY_CASH_VOUCHER_BY_ID,
  REJECT_PURCHASING_PETTY_CASH_VOUCHER,
  SUBMIT_PURCHASING_PETTY_CASH_VOUCHER,
  VOID_PURCHASING_PETTY_CASH_VOUCHER,
} from '../gql';

const P = Permissions;

type Asking = 'reject' | 'void' | null;

const VoucherPage = ({ match, history }: RouteComponentProps<{ voucherId: string }>) => {
  const { voucherId } = match.params;
  const { can } = usePurchasingAccess();
  const [asking, setAsking] = useState<Asking>(null);
  const { data, loading } = useQuery(PURCHASING_PETTY_CASH_VOUCHER_BY_ID, { variables: { _id: voucherId }, fetchPolicy: 'cache-and-network' });
  const voucher = data?.purchasingPettyCashVoucherById;

  const refetchQueries = [
    'purchasingPettyCashVoucherById',
    'pagedPurchasingPettyCashVouchers',
    'pagedPurchasingPettyCashFunds',
    'pagedPurchasingPettyCashReplenishments',
  ];
  const [submit] = useMutation(SUBMIT_PURCHASING_PETTY_CASH_VOUCHER, { refetchQueries });
  const [approve] = useMutation(APPROVE_PURCHASING_PETTY_CASH_VOUCHER, { refetchQueries });
  const [reject] = useMutation(REJECT_PURCHASING_PETTY_CASH_VOUCHER, { refetchQueries });
  const [voidVoucher] = useMutation(VOID_PURCHASING_PETTY_CASH_VOUCHER, { refetchQueries });
  const [remove] = useMutation(DELETE_PURCHASING_PETTY_CASH_VOUCHER, { refetchQueries });

  useDynamicBreadcrumbs(['Purchasing', 'Petty Cash Vouchers', voucher?.number || '']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!voucher?._id) return <Empty description="Voucher not found" style={{ padding: '80px 0' }} />;

  const status = voucher.status ?? '';
  const canManage = can(P.PURCHASING_MANAGE_PETTY_CASH_VOUCHERS);
  const canApprove = can(P.PURCHASING_APPROVE_PETTY_CASH_VOUCHERS);
  const lines = (voucher.lines ?? []).filter((l) => l != null);

  const actions: React.ReactNode[] = [];
  if (canManage && ['draft', 'rejected'].includes(status)) {
    actions.push(
      <Button key="edit" onClick={() => history.push(paths.pettyCashVoucherEditPath(voucher._id!))}>Edit</Button>,
      <Button
        key="submit"
        type="primary"
        onClick={() => runAction(submit({ variables: { _id: voucher._id! } }), 'Voucher submitted')}
      >
        Submit for Approval
      </Button>
    );
  }
  if (canManage && status === 'draft') {
    actions.push(
      <Popconfirm
        key="delete"
        title="Delete this draft?"
        onConfirm={async () => {
          const ok = await runAction(remove({ variables: { _id: voucher._id! } }), 'Voucher deleted');
          if (ok) history.replace(paths.pettyCashVouchersPath);
        }}
      >
        <Button danger>Delete</Button>
      </Popconfirm>
    );
  }
  if (canApprove && status === 'submitted') {
    actions.push(
      <Popconfirm
        key="approve"
        title="Approve and pay out this voucher?"
        description="The cash leaves the fund and any stock lines are added to their stores."
        onConfirm={() => runAction(approve({ variables: { _id: voucher._id! } }), 'Voucher approved')}
      >
        <Button type="primary">Approve</Button>
      </Popconfirm>,
      <Button key="reject" danger onClick={() => setAsking('reject')}>Reject</Button>
    );
  }
  if (canApprove && status === 'approved' && !voucher.replenishmentId) {
    actions.push(<Button key="void" danger onClick={() => setAsking('void')}>Void</Button>);
  }

  const items = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <div className="purchasing-document">
          <Descriptions bordered size="small" column={2} style={{ marginBottom: 12 }}>
            <Descriptions.Item label="Fund">{voucher.fund?.name}</Descriptions.Item>
            <Descriptions.Item label="Expense Head">{voucher.expenseHead?.name}</Descriptions.Item>
            <Descriptions.Item label="Date">{formatDate(voucher.voucherDate)}</Descriptions.Item>
            <Descriptions.Item label="Paid To">{voucher.payee}</Descriptions.Item>
            <Descriptions.Item label="Vendor">{voucher.vendor?.name}</Descriptions.Item>
            <Descriptions.Item label="Purpose" span={2}>{voucher.purpose}</Descriptions.Item>
            {voucher.replenishmentId ? (
              <Descriptions.Item label="Replenishment" span={2}>
                <Link to={paths.pettyCashReplenishmentViewPath(voucher.replenishmentId)}>View replenishment</Link>
              </Descriptions.Item>
            ) : null}
            {status === 'rejected' ? (
              <Descriptions.Item label="Rejected" span={2}>
                {formatDate(voucher.rejectedAt)}: {voucher.rejectionReason}
              </Descriptions.Item>
            ) : null}
            {status === 'voided' ? (
              <Descriptions.Item label="Voided" span={2}>
                {formatDate(voucher.voidedAt)}: {voucher.voidReason}
              </Descriptions.Item>
            ) : null}
          </Descriptions>
          <Table
            className="list-table"
            rowKey="_id"
            size="small"
            bordered
            pagination={false}
            dataSource={lines as any[]}
            columns={[
              { title: 'Item', dataIndex: 'description' },
              { title: 'Unit', dataIndex: 'unit', width: 80 },
              { title: 'Quantity', dataIndex: 'quantity', width: 100, align: 'right', render: formatQuantity },
              { title: 'Price', dataIndex: 'unitPrice', width: 110, align: 'right', render: formatMoney },
              { title: 'Amount', dataIndex: 'amount', width: 120, align: 'right', render: formatMoney },
              {
                title: 'Added to Store',
                key: 'store',
                width: 220,
                render: (_: unknown, line: any) =>
                  line.externalCatalogId ? `${line.stockItemName ?? 'Item'} - ${line.physicalStoreName ?? ''}` : '',
              },
            ]}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right"><strong>Total</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right"><strong>{formatMoney(voucher.total)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={2} />
              </Table.Summary.Row>
            )}
          />
          <div style={{ height: 12 }} />
          <AuditInfo record={voucher} />
        </div>
      ),
    },
    {
      key: 'receipts',
      label: 'Receipts',
      children: (
        <AttachmentsTab
          ownerType="petty-cash-voucher"
          ownerId={voucher._id!}
          canManage={canManage && ['draft', 'rejected'].includes(status)}
        />
      ),
    },
    ...(can(P.PURCHASING_VIEW_AUDIT_LOGS)
      ? [{ key: 'history', label: 'History', children: <HistoryTab entityId={voucher._id!} /> }]
      : []),
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }} size={12}>
        <strong>{voucher.number}</strong>
        <StatusTag status={status} />
      </Space>
      {actions.length ? <div className="purchasing-actions-bar"><Space>{actions}</Space></div> : null}
      <Tabs items={items} />
      <ReasonModal
        open={asking === 'reject'}
        title="Reject Voucher"
        okText="Reject"
        onCancel={() => setAsking(null)}
        onOk={async (reason) => {
          const ok = await runAction(reject({ variables: { _id: voucher._id!, reason } }), 'Voucher rejected');
          if (ok) setAsking(null);
        }}
      />
      <ReasonModal
        open={asking === 'void'}
        title="Void Voucher"
        okText="Void"
        onCancel={() => setAsking(null)}
        onOk={async (reason) => {
          const ok = await runAction(voidVoucher({ variables: { _id: voucher._id!, reason } }), 'Voucher voided');
          if (ok) setAsking(null);
        }}
      />
    </>
  );
};

export default VoucherPage;
