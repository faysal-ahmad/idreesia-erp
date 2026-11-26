import React, { useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Descriptions, Empty, Space, Spin, Table, Tabs } from 'antd';

import { Permissions } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import AttachmentsTab from '../common/attachments-tab';
import HistoryTab from '../common/history-tab';
import { formatDate, formatMoney } from '../common/format';
import ReasonModal from '../common/reason-modal';
import { runAction } from '../common/run-action';
import StatusTag from '../common/status-tag';
import usePurchasingAccess from '../common/use-purchasing-access';
import { default as paths } from '../submodule-paths';
import { METHOD_LABELS } from './list';
import { PURCHASING_PAYMENT_BY_ID, VOID_PURCHASING_PAYMENT } from './gql';

const P = Permissions;

const PaymentPage = ({ match }: RouteComponentProps<{ paymentId: string }>) => {
  const { paymentId } = match.params;
  const { can } = usePurchasingAccess();
  const [voiding, setVoiding] = useState(false);
  const { data, loading } = useQuery(PURCHASING_PAYMENT_BY_ID, { variables: { _id: paymentId }, fetchPolicy: 'cache-and-network' });
  const payment = data?.purchasingPaymentById;
  const [voidPayment] = useMutation(VOID_PURCHASING_PAYMENT, {
    refetchQueries: ['purchasingPaymentById', 'pagedPurchasingPayments', 'pagedPurchasingInvoices', 'purchasingInvoiceById', 'purchasingDashboard'],
  });

  useDynamicBreadcrumbs(['Purchasing', 'Payments', payment?.number || '']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!payment?._id) return <Empty description="Payment not found" style={{ padding: '80px 0' }} />;

  const allocations = (payment.allocations ?? []).filter((a) => a != null);

  const items = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <div className="purchasing-document">
          <Descriptions bordered size="small" column={2} style={{ marginBottom: 12 }}>
            <Descriptions.Item label="Vendor">{payment.vendor?.name}</Descriptions.Item>
            <Descriptions.Item label="Date">{formatDate(payment.paymentDate)}</Descriptions.Item>
            <Descriptions.Item label="Method">{METHOD_LABELS[payment.method ?? ''] ?? payment.method}</Descriptions.Item>
            <Descriptions.Item label="Reference">{payment.reference}</Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>{payment.notes}</Descriptions.Item>
            {payment.status === 'voided' ? (
              <Descriptions.Item label="Voided" span={2}>
                {formatDate(payment.voidedAt)}: {payment.voidReason}
              </Descriptions.Item>
            ) : null}
          </Descriptions>
          <Table
            className="list-table"
            rowKey="invoiceId"
            size="small"
            bordered
            pagination={false}
            dataSource={allocations as any[]}
            columns={[
              {
                title: 'Invoice',
                key: 'invoice',
                render: (_: unknown, a: any) => (
                  <Link to={paths.invoiceViewPath(a.invoiceId)}>
                    {a.invoice?.number} ({a.invoice?.vendorInvoiceNo})
                  </Link>
                ),
              },
              { title: 'Invoice Total', key: 'total', width: 150, align: 'right', render: (_: unknown, a: any) => formatMoney(a.invoice?.total) },
              { title: 'Paid', dataIndex: 'amount', width: 150, align: 'right', render: formatMoney },
            ]}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}><strong>Total</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right"><strong>{formatMoney(payment.amount)}</strong></Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
          <div style={{ height: 12 }} />
          <AuditInfo record={payment} />
        </div>
      ),
    },
    {
      key: 'attachments',
      label: 'Attachments',
      children: <AttachmentsTab ownerType="payment" ownerId={payment._id!} canManage={can(P.PURCHASING_MANAGE_PAYMENTS)} />,
    },
    ...(can(P.PURCHASING_VIEW_AUDIT_LOGS)
      ? [{ key: 'history', label: 'History', children: <HistoryTab entityId={payment._id!} /> }]
      : []),
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }} size={12}>
        <strong>{payment.number}</strong>
        <StatusTag status={payment.status} />
        <span style={{ color: '#667085' }}>{formatMoney(payment.amount)}</span>
      </Space>
      {payment.status === 'posted' && can(P.PURCHASING_MANAGE_PAYMENTS) ? (
        <div className="purchasing-actions-bar">
          <Button danger onClick={() => setVoiding(true)}>Void Payment</Button>
        </div>
      ) : null}
      <Tabs items={items} className={items.length === 1 ? 'purchasing-single-tab' : undefined} />
      <ReasonModal
        open={voiding}
        title="Void Payment"
        okText="Void"
        onCancel={() => setVoiding(false)}
        onOk={async (reason) => {
          const ok = await runAction(voidPayment({ variables: { _id: payment._id!, reason } }), 'Payment voided');
          if (ok) setVoiding(false);
        }}
      />
    </>
  );
};

export default PaymentPage;
