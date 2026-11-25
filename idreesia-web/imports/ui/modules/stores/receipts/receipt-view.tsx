import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { type RouteComponentProps } from 'react-router';
import { useParams } from 'react-router-dom';
import { Alert, Button, Descriptions, Empty, Input, Modal, Space, Spin, Table } from 'antd';

import { Permissions, ModuleNames } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { message } from '/imports/ui/antd-feedback';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import {
  usePhysicalStore,
  useStorePermissions,
} from '/imports/ui/modules/stores/common/hooks';
import StatusTag from '../common/purchasing/status-tag';
import { formatDate, formatQuantity } from '../common/purchasing/format';
import { STORE_RECEIPT_BY_ID, VOID_STORE_RECEIPT } from './gql';

type RouteParams = { physicalStoreId: string; receiptId: string };

/** A posted goods receipt. It can be voided, which takes the goods back out of the store's stock. */
const ReceiptView = ({ history }: RouteComponentProps<RouteParams>) => {
  const { physicalStoreId, receiptId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { can } = useStorePermissions(physicalStoreId);
  const [voiding, setVoiding] = useState(false);
  const [reason, setReason] = useState('');

  const { data, loading } = useQuery(STORE_RECEIPT_BY_ID, {
    variables: { physicalStoreId, _id: receiptId },
    fetchPolicy: 'cache-and-network',
  });
  const receipt = data?.storeReceiptById;
  const [voidReceipt, { loading: voidingNow }] = useMutation(VOID_STORE_RECEIPT, {
    refetchQueries: ['pagedStoreReceipts', 'storeReceiptById', 'pagedStoreOrders', 'storeOrderById', 'pagedStockItems'],
  });

  useDynamicBreadcrumbs([
    ModuleNames.stores,
    physicalStore?.name ?? '',
    'Goods Receipts',
    receipt?.number ?? '',
  ]);

  if (loading && !receipt) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!receipt?._id) {
    return <Empty description="Receipt not found" style={{ padding: '80px 0' }} />;
  }

  const lines = (receipt.lines ?? []).filter((line): line is NonNullable<typeof line> => line != null);
  const canVoid = can(Permissions.IN_MANAGE_RECEIPTS) && receipt.status === 'posted';

  const handleVoid = async () => {
    try {
      await voidReceipt({ variables: { physicalStoreId, _id: receipt._id as string, reason } });
      message.success('Receipt voided', 5);
      setVoiding(false);
      setReason('');
    } catch (error) {
      // E.g. the goods were already issued from the store.
      message.error((error as Error).message, 8);
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <Space style={{ marginBottom: 12 }} wrap>
        <StatusTag status={receipt.status} />
        {canVoid ? (
          <Button danger onClick={() => setVoiding(true)}>
            Void Receipt
          </Button>
        ) : null}
        <Button onClick={() => history.push(paths.goodsReceiptsPath(physicalStoreId))}>
          Back to List
        </Button>
      </Space>
      {receipt.status === 'voided' ? (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 12 }}
          message={`Voided${receipt.voidedAt ? ` on ${formatDate(receipt.voidedAt)}` : ''}`}
          description={receipt.voidReason}
        />
      ) : null}
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Receipt">{receipt.number}</Descriptions.Item>
        <Descriptions.Item label="Order">{receipt.orderNumber}</Descriptions.Item>
        <Descriptions.Item label="Received On">{formatDate(receipt.receivedDate)}</Descriptions.Item>
        <Descriptions.Item label="Received By">
          {receipt.receivedByPerson?.sharedData?.name}
        </Descriptions.Item>
        <Descriptions.Item label="Delivery Note">{receipt.deliveryNoteNo}</Descriptions.Item>
        <Descriptions.Item label="Notes">{receipt.notes}</Descriptions.Item>
      </Descriptions>
      <Table
        size="small"
        bordered
        rowKey="_id"
        pagination={false}
        dataSource={lines}
        columns={[
          { title: 'Item', dataIndex: 'description', key: 'description' },
          { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 90 },
          {
            title: 'Accepted',
            dataIndex: 'receivedQuantity',
            key: 'receivedQuantity',
            width: 110,
            render: (value: number) => formatQuantity(value),
          },
          {
            title: 'Rejected',
            dataIndex: 'rejectedQuantity',
            key: 'rejectedQuantity',
            width: 110,
            render: (value: number) => formatQuantity(value),
          },
          { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
        ]}
      />
      <AuditInfo record={{ createdAt: receipt.createdAt }} />
      <Modal
        title="Void this receipt?"
        open={voiding}
        okText="Void Receipt"
        okButtonProps={{ danger: true, disabled: !reason.trim(), loading: voidingNow }}
        onOk={handleVoid}
        onCancel={() => setVoiding(false)}
      >
        <p>The accepted goods are taken back out of the store's stock.</p>
        <Input.TextArea
          rows={3}
          placeholder="Reason"
          value={reason}
          onChange={event => setReason(event.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ReceiptView;
