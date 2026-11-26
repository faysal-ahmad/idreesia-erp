import React, { useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Descriptions, Empty, Popconfirm, Space, Spin, Table, Tabs } from 'antd';

import { Permissions } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import HistoryTab from '../../common/history-tab';
import { formatDate, formatMoney } from '../../common/format';
import ReasonModal from '../../common/reason-modal';
import { runAction } from '../../common/run-action';
import StatusTag from '../../common/status-tag';
import usePurchasingAccess from '../../common/use-purchasing-access';
import { default as paths } from '../../submodule-paths';
import {
  APPROVE_PURCHASING_PETTY_CASH_REPLENISHMENT,
  PAGED_PURCHASING_PETTY_CASH_VOUCHERS,
  PURCHASING_PETTY_CASH_REPLENISHMENT_BY_ID,
  REJECT_PURCHASING_PETTY_CASH_REPLENISHMENT,
} from '../gql';

const P = Permissions;

const ReplenishmentPage = ({ match }: RouteComponentProps<{ replenishmentId: string }>) => {
  const { replenishmentId } = match.params;
  const { can } = usePurchasingAccess();
  const [rejecting, setRejecting] = useState(false);
  const { data, loading } = useQuery(PURCHASING_PETTY_CASH_REPLENISHMENT_BY_ID, {
    variables: { _id: replenishmentId },
    fetchPolicy: 'cache-and-network',
  });
  const replenishment = data?.purchasingPettyCashReplenishmentById;
  const { data: voucherData } = useQuery(PAGED_PURCHASING_PETTY_CASH_VOUCHERS, {
    variables: { replenishmentId, pageIndex: 0, pageSize: 200 },
    skip: !replenishment?._id,
    fetchPolicy: 'cache-and-network',
  });
  const vouchers = (voucherData?.pagedPurchasingPettyCashVouchers?.data ?? []).filter((v) => v != null);

  const refetchQueries = [
    'purchasingPettyCashReplenishmentById',
    'pagedPurchasingPettyCashReplenishments',
    'pagedPurchasingPettyCashVouchers',
    'pagedPurchasingPettyCashFunds',
  ];
  const [approve] = useMutation(APPROVE_PURCHASING_PETTY_CASH_REPLENISHMENT, { refetchQueries });
  const [reject] = useMutation(REJECT_PURCHASING_PETTY_CASH_REPLENISHMENT, { refetchQueries });

  useDynamicBreadcrumbs(['Purchasing', 'Petty Cash Replenishments', replenishment?.number || '']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!replenishment?._id) return <Empty description="Replenishment not found" style={{ padding: '80px 0' }} />;

  const canApprove = can(P.PURCHASING_APPROVE_PETTY_CASH_REPLENISHMENTS) && replenishment.status === 'submitted';

  const items = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <div className="purchasing-document">
          <Descriptions bordered size="small" column={2} style={{ marginBottom: 12 }}>
            <Descriptions.Item label="Fund">{replenishment.fund?.name}</Descriptions.Item>
            <Descriptions.Item label="Requested">{formatDate(replenishment.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="Amount to Refill">{formatMoney(replenishment.amount)}</Descriptions.Item>
            <Descriptions.Item label="Fund Balance Now">{formatMoney(replenishment.fund?.balance)}</Descriptions.Item>
            <Descriptions.Item label="Cash Counted">{formatMoney(replenishment.countedCash)}</Descriptions.Item>
            <Descriptions.Item label="Cash Variance">{formatMoney(replenishment.variance)}</Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>{replenishment.notes}</Descriptions.Item>
            {replenishment.status === 'rejected' ? (
              <Descriptions.Item label="Rejected" span={2}>
                {formatDate(replenishment.rejectedAt)}: {replenishment.rejectionReason}
              </Descriptions.Item>
            ) : null}
          </Descriptions>
          <Table
            className="list-table"
            rowKey="_id"
            size="small"
            bordered
            pagination={false}
            dataSource={vouchers as any[]}
            columns={[
              {
                title: 'Voucher',
                dataIndex: 'number',
                width: 150,
                render: (text: string, row: any) => <Link to={paths.pettyCashVoucherViewPath(row._id)}>{text}</Link>,
              },
              { title: 'Date', dataIndex: 'voucherDate', width: 120, render: formatDate },
              { title: 'Paid To', dataIndex: 'payee' },
              { title: 'Purpose', dataIndex: 'purpose' },
              { title: 'Total', dataIndex: 'total', width: 120, align: 'right', render: formatMoney },
            ]}
          />
          <div style={{ height: 12 }} />
          <AuditInfo record={replenishment} />
        </div>
      ),
    },
    ...(can(P.PURCHASING_VIEW_AUDIT_LOGS)
      ? [{ key: 'history', label: 'History', children: <HistoryTab entityId={replenishment._id!} /> }]
      : []),
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }} size={12}>
        <strong>{replenishment.number}</strong>
        <StatusTag status={replenishment.status} />
      </Space>
      {canApprove ? (
        <div className="purchasing-actions-bar">
          <Space>
            <Popconfirm
              title="Approve this replenishment?"
              description="The amount goes back into the fund."
              onConfirm={() =>
                runAction(approve({ variables: { _id: replenishment._id! } }), 'Replenishment approved')
              }
            >
              <Button type="primary">Approve</Button>
            </Popconfirm>
            <Button danger onClick={() => setRejecting(true)}>Reject</Button>
          </Space>
        </div>
      ) : null}
      <Tabs items={items} className={items.length === 1 ? 'purchasing-single-tab' : undefined} />
      <ReasonModal
        open={rejecting}
        title="Reject Replenishment"
        okText="Reject"
        onCancel={() => setRejecting(false)}
        onOk={async (reason) => {
          const ok = await runAction(
            reject({ variables: { _id: replenishment._id!, reason } }),
            'Replenishment rejected'
          );
          if (ok) setRejecting(false);
        }}
      />
    </>
  );
};

export default ReplenishmentPage;
