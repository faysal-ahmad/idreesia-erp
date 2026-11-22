import React, { useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Descriptions, Empty, Space, Spin, Table, Tabs } from 'antd';

import { Permissions } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import AttachmentsTab from '../common/attachments-tab';
import HistoryTab from '../common/history-tab';
import { formatDate, formatQuantity } from '../common/format';
import ReasonModal from '../common/reason-modal';
import { runAction } from '../common/run-action';
import StatusTag from '../common/status-tag';
import usePurchasingAccess from '../common/use-purchasing-access';
import { default as paths } from '../submodule-paths';
import { PURCHASING_RECEIPT_BY_ID, VOID_PURCHASING_RECEIPT } from './gql';

const P = Permissions;

const ReceiptPage = ({ match }: RouteComponentProps<{ receiptId: string }>) => {
  const { receiptId } = match.params;
  const { can } = usePurchasingAccess();
  const [voiding, setVoiding] = useState(false);
  const { data, loading } = useQuery(PURCHASING_RECEIPT_BY_ID, { variables: { _id: receiptId } });
  const receipt = data?.purchasingReceiptById;
  const [voidReceipt] = useMutation(VOID_PURCHASING_RECEIPT, {
    refetchQueries: ['purchasingReceiptById', 'pagedPurchasingReceipts', 'purchasingOrderById', 'pagedPurchasingOrders'],
  });

  useDynamicBreadcrumbs(['Purchasing', 'Goods Receipts', receipt?.number || '']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!receipt?._id) return <Empty description="Receipt not found" style={{ padding: '80px 0' }} />;

  const lines = (receipt.lines ?? []).filter((l) => l != null);

  const items = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <div className="purchasing-document">
          <Descriptions bordered size="small" column={2} style={{ marginBottom: 12 }}>
            <Descriptions.Item label="Order">
              {receipt.order?._id ? <Link to={paths.orderEditPath(receipt.order._id)}>{receipt.order.number}</Link> : ''}
            </Descriptions.Item>
            <Descriptions.Item label="Vendor">{receipt.vendor?.name}</Descriptions.Item>
            <Descriptions.Item label="Received On">{formatDate(receipt.receivedDate)}</Descriptions.Item>
            <Descriptions.Item label="Received By">{receipt.receivedByPerson?.sharedData?.name}</Descriptions.Item>
            <Descriptions.Item label="Delivery Note">{receipt.deliveryNoteNo}</Descriptions.Item>
            <Descriptions.Item label="Notes">{receipt.notes}</Descriptions.Item>
            {receipt.status === 'voided' ? (
              <Descriptions.Item label="Voided" span={2}>
                {formatDate(receipt.voidedAt)}: {receipt.voidReason}
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
              { title: 'Received', dataIndex: 'receivedQuantity', width: 110, align: 'right', render: formatQuantity },
              { title: 'Rejected', dataIndex: 'rejectedQuantity', width: 110, align: 'right', render: formatQuantity },
              { title: 'Remarks', dataIndex: 'remarks' },
            ]}
          />
          <div style={{ height: 12 }} />
          <AuditInfo record={receipt} />
        </div>
      ),
    },
    {
      key: 'attachments',
      label: 'Attachments',
      children: <AttachmentsTab ownerType="receipt" ownerId={receipt._id!} canManage={can(P.PURCHASING_MANAGE_RECEIPTS)} />,
    },
    ...(can(P.PURCHASING_VIEW_AUDIT_LOGS)
      ? [{ key: 'history', label: 'History', children: <HistoryTab entityId={receipt._id!} /> }]
      : []),
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }} size={12}>
        <strong>{receipt.number}</strong>
        <StatusTag status={receipt.status} />
      </Space>
      {receipt.status === 'posted' && can(P.PURCHASING_MANAGE_RECEIPTS) ? (
        <div className="purchasing-actions-bar">
          <Button danger onClick={() => setVoiding(true)}>Void Receipt</Button>
        </div>
      ) : null}
      <Tabs items={items} />
      <ReasonModal
        open={voiding}
        title="Void Receipt"
        okText="Void"
        onCancel={() => setVoiding(false)}
        onOk={async (reason) => {
          const ok = await runAction(voidReceipt({ variables: { _id: receipt._id!, reason } }), 'Receipt voided');
          if (ok) setVoiding(false);
        }}
      />
    </>
  );
};

export default ReceiptPage;
