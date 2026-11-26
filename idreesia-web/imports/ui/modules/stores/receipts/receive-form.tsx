import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs, { type Dayjs } from 'dayjs';
import { type RouteComponentProps } from 'react-router';
import { useParams } from 'react-router-dom';
import { Alert, Collapse, Empty, Form, Input, InputNumber, Spin, Table } from 'antd';

import { Permissions, ModuleNames } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { message } from '/imports/ui/antd-feedback';
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';
import { StoreKarkunField } from '/imports/ui/modules/stores/common/controls';
import { StoresSubModulePaths as paths } from '/imports/ui/modules/stores';
import {
  usePhysicalStore,
  useStorePermissions,
} from '/imports/ui/modules/stores/common/hooks';
import { STORE_ORDER_BY_ID } from '../incoming-orders/gql';
import { formatQuantity, toDateInput } from '../common/purchasing/format';
import { POST_STORE_RECEIPT } from './gql';

const RECEIVABLE = ['approved', 'sent', 'partially-received'];

interface FormValues {
  receivedDate: Dayjs;
  receivedBy?: { _id?: string } | null;
  deliveryNoteNo?: string;
  notes?: string;
  lines: { received?: number | null; rejected?: number | null; remarks?: string }[];
}

type RouteParams = { physicalStoreId: string; orderId: string };

/** Receiving the goods that arrived against an order: what was accepted adds to the store's stock. */
const ReceiveForm = ({ history }: RouteComponentProps<RouteParams>) => {
  const { physicalStoreId, orderId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { can, loading: permissionsLoading } = useStorePermissions(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [form] = Form.useForm<FormValues>();

  const { data, loading } = useQuery(STORE_ORDER_BY_ID, {
    variables: { physicalStoreId, _id: orderId },
    fetchPolicy: 'cache-and-network',
  });
  const order = data?.storeOrderById;
  const [postReceipt, { loading: saving }] = useMutation(POST_STORE_RECEIPT, {
    refetchQueries: ['pagedStoreReceipts', 'pagedStoreOrders', 'storeOrderById', 'pagedStockItems'],
  });

  useDynamicBreadcrumbs([
    ModuleNames.stores,
    physicalStore?.name ?? '',
    'Goods Receipts',
    'Receive Goods',
  ]);

  if ((loading && !order) || permissionsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!order?._id) {
    return <Empty description="Order not found" style={{ padding: '80px 0' }} />;
  }
  if (!can(Permissions.IN_MANAGE_RECEIPTS)) {
    return <Alert type="warning" showIcon message="You can't receive goods for this store." />;
  }
  if (!RECEIVABLE.includes(order.status ?? '')) {
    return (
      <Alert
        type="info"
        showIcon
        message={`Goods can't be received against this order (${order.status}).`}
      />
    );
  }

  const lines = (order.lines ?? []).filter((line): line is NonNullable<typeof line> => line != null);
  const due = (line: (typeof lines)[number]) =>
    Math.max(0, Math.round(((line.quantity ?? 0) - (line.receivedQuantity ?? 0)) * 1000) / 1000);

  const handleFinish = async (values: FormValues) => {
    const receiptLines = lines
      .map((line, index) => ({
        orderLineId: line._id as string,
        receivedQuantity: values.lines?.[index]?.received ?? 0,
        rejectedQuantity: values.lines?.[index]?.rejected ?? 0,
        remarks: values.lines?.[index]?.remarks || undefined,
      }))
      .filter(line => line.receivedQuantity > 0 || line.rejectedQuantity > 0);
    if (receiptLines.length === 0) {
      message.info('Enter a received or rejected quantity for at least one item.', 5);
      return;
    }
    try {
      const result = await postReceipt({
        variables: {
          physicalStoreId,
          orderId,
          receivedDate: toDateInput(values.receivedDate) as string,
          receivedBy: values.receivedBy?._id,
          deliveryNoteNo: values.deliveryNoteNo,
          notes: values.notes,
          lines: receiptLines,
        },
      });
      message.success('Goods received', 5);
      const receiptId = result.data?.postStoreReceipt?._id;
      history.replace(
        receiptId
          ? paths.goodsReceiptsViewPath(physicalStoreId, receiptId)
          : paths.goodsReceiptsPath(physicalStoreId)
      );
    } catch (error) {
      message.error((error as Error).message, 5);
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <Form
        form={form}
        layout="horizontal"
        initialValues={{
          lines: lines.map(line => ({ received: due(line), rejected: 0 })),
        }}
        onFinish={handleFinish}
        onFieldsChange={() => setIsFieldsTouched(true)}
      >
        <Collapse
          className="visitor-form-sections"
          defaultActiveKey={['general', 'items']}
          items={[
            {
              key: 'general',
              label: `Order ${order.number} from ${order.vendorName ?? ''}`,
              forceRender: true,
              children: (
                <>
                  <DateField
                    fieldName="receivedDate"
                    fieldLabel="Received On"
                    initialValue={dayjs()}
                    required
                    requiredMessage="Please choose the date the goods arrived."
                  />
                  <StoreKarkunField
                    fieldName="receivedBy"
                    fieldLabel="Received By"
                    placeholder="Received By"
                  />
                  <InputTextField fieldName="deliveryNoteNo" fieldLabel="Delivery Note No." />
                  <InputTextAreaField fieldName="notes" fieldLabel="Notes" />
                </>
              ),
            },
            {
              key: 'items',
              label: 'Items Received',
              forceRender: true,
              children: (
                <Table
                  size="small"
                  bordered
                  rowKey="_id"
                  pagination={false}
                  dataSource={lines}
                  columns={[
                    {
                      title: 'Item',
                      key: 'description',
                      render: (_text: unknown, line) => `${line.description} (${line.unit})`,
                    },
                    {
                      title: 'Still Due',
                      key: 'due',
                      width: 90,
                      render: (_text: unknown, line) => formatQuantity(due(line)),
                    },
                    {
                      title: 'Accepted',
                      key: 'received',
                      width: 130,
                      render: (_text: unknown, line, index) => (
                        <Form.Item
                          name={['lines', index, 'received']}
                          style={{ margin: 0 }}
                          rules={[
                            {
                              type: 'number',
                              max: due(line),
                              message: `At most ${formatQuantity(due(line))}`,
                            },
                          ]}
                        >
                          <InputNumber min={0} precision={2} />
                        </Form.Item>
                      ),
                    },
                    {
                      title: 'Rejected',
                      key: 'rejected',
                      width: 130,
                      render: (_text: unknown, _line, index) => (
                        <Form.Item name={['lines', index, 'rejected']} style={{ margin: 0 }}>
                          <InputNumber min={0} precision={2} />
                        </Form.Item>
                      ),
                    },
                    {
                      title: 'Remarks',
                      key: 'remarks',
                      width: 180,
                      render: (_text: unknown, _line, index) => (
                        <Form.Item name={['lines', index, 'remarks']} style={{ margin: 0 }}>
                          <Input />
                        </Form.Item>
                      ),
                    },
                  ]}
                />
              ),
            },
          ]}
        />
        <Alert
          style={{ margin: '12px 0' }}
          type="info"
          showIcon
          message="The accepted quantities are added to the store's stock. Rejected goods are only recorded."
        />
        <FormButtonsSaveCancel
          fullWidth
          handleCancel={() => history.goBack()}
          isFieldsTouched={isFieldsTouched && !saving}
        />
      </Form>
    </div>
  );
};

export default ReceiveForm;
