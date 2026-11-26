import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import { parse } from 'query-string';
import { useMutation, useQuery } from '@apollo/client/react';
import { Collapse, Empty, Form, Input, InputNumber, Modal, Spin, Table } from 'antd';
import dayjs from 'dayjs';

import { useDynamicBreadcrumbs, useLoggedInUser } from 'meteor/idreesia-common/hooks/common';
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';
import { PersonPickerField } from '/imports/ui/modules/helpers/controls';
import { purchasingKarkunSource } from '../common/gql';

import { formatQuantity, toDateInput } from '../common/format';
import RecordSelect from '../common/record-select';
import { PAGED_PURCHASING_ORDERS, PURCHASING_ORDER_BY_ID } from '../orders/gql';
import { default as paths } from '../submodule-paths';
import { POST_PURCHASING_RECEIPT } from './gql';

interface LineValues {
  orderLineId: string;
  receivedQuantity?: number | null;
  rejectedQuantity?: number | null;
  remarks?: string;
}

interface FormValues {
  receivedDate?: dayjs.Dayjs | null;
  receivedBy?: { _id?: string } | null;
  deliveryNoteNo?: string;
  notes?: string;
  lines: LineValues[];
}

const RECEIVABLE = ['approved', 'sent', 'partially-received'];

const NewReceipt = ({ history, location }: RouteComponentProps) => {
  useDynamicBreadcrumbs(['Purchasing', 'Goods Receipts', 'New']);
  const presetOrderId = String(parse(location.search).orderId ?? '') || undefined;
  const [orderId, setOrderId] = useState<string | undefined>(presetOrderId);
  const { user } = useLoggedInUser();

  const { data, loading } = useQuery(PURCHASING_ORDER_BY_ID, {
    variables: { _id: orderId ?? '' },
    skip: !orderId,
  });
  const order = data?.purchasingOrderById;
  const [postReceipt, { loading: saving }] = useMutation(POST_PURCHASING_RECEIPT, {
    refetchQueries: ['pagedPurchasingReceipts', 'purchasingOrderById', 'pagedPurchasingOrders'],
  });

  // Only lines with goods still due are listed.
  const dueLines = (order?.lines ?? []).filter(
    (l): l is NonNullable<typeof l> => l != null && (l.quantity ?? 0) - (l.receivedQuantity ?? 0) > 0
  );

  const handleFinish = async (values: FormValues) => {
    const lines = (values.lines ?? [])
      .filter((l) => (l.receivedQuantity ?? 0) > 0 || (l.rejectedQuantity ?? 0) > 0)
      .map((l) => ({
        orderLineId: l.orderLineId,
        receivedQuantity: l.receivedQuantity ?? 0,
        rejectedQuantity: l.rejectedQuantity ?? undefined,
        remarks: l.remarks,
      }));
    const result = await postReceipt({
      variables: {
        orderId: orderId!,
        receivedDate: toDateInput(values.receivedDate)!,
        receivedBy: values.receivedBy?._id,
        deliveryNoteNo: values.deliveryNoteNo,
        notes: values.notes,
        lines,
      },
    }).catch((error: Error) => {
      Modal.error({ title: 'Could not save the receipt', content: error.message });
      return null;
    });
    const id = result?.data?.postPurchasingReceipt?._id;
    if (id) history.replace(paths.receiptViewPath(id));
  };

  const orderPicker = (
    <Form layout="horizontal" style={{ marginBottom: 12 }}>
      <Form.Item label="Purchase Order" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
        <RecordSelect
          value={orderId}
          onChange={setOrderId}
          query={PAGED_PURCHASING_ORDERS}
          dataKey="pagedPurchasingOrders"
          // Goods for a store are received by the store, not by purchasing.
          variables={{ source: 'purchasing' }}
          filterRow={(o) => RECEIVABLE.includes(o.status) && o.source !== 'store'}
          labelOf={(o) => (o.number ? `${o.number} - ${o.vendor?.name ?? ''}` : '')}
          selected={order}
          placeholder="Choose the order the goods are for"
        />
      </Form.Item>
    </Form>
  );

  let body: React.ReactNode = null;
  if (orderId && loading) {
    body = <Spin />;
  } else if (orderId && order) {
    if (order.source === 'store') {
      body = <Empty description="Goods for a store are received by the store." />;
    } else if (!RECEIVABLE.includes(order.status ?? '')) {
      body = <Empty description="Goods can't be received against this order." />;
    } else if (dueLines.length === 0) {
      body = <Empty description="Everything on this order has been received." />;
    } else {
      body = (
        <Form
          key={order._id}
          layout="horizontal"
          onFinish={handleFinish}
          initialValues={{
            lines: dueLines.map((l) => ({
              orderLineId: l._id,
              receivedQuantity: (l.quantity ?? 0) - (l.receivedQuantity ?? 0),
              rejectedQuantity: 0,
            })),
          }}
        >
          <Collapse
            className="visitor-form-sections"
            defaultActiveKey={['general', 'items']}
            items={[
              {
                key: 'general',
                label: `Order ${order.number} - ${order.vendor?.name ?? ''}`,
                forceRender: true,
                children: (
                  <>
                    <DateField
                      fieldName="receivedDate"
                      fieldLabel="Received On"
                      initialValue={dayjs()}
                      required
                      requiredMessage="Please choose the date."
                    />
                    <PersonPickerField
                      source={purchasingKarkunSource}
                      fieldName="receivedBy"
                      fieldLabel="Received By"
                      initialValue={
                        user?.karkun?._id
                          ? { _id: user.karkun._id, name: user.karkun.sharedData?.name }
                          : null
                      }
                    />
                    <InputTextField fieldName="deliveryNoteNo" fieldLabel="Delivery Note No." />
                    <InputTextAreaField fieldName="notes" fieldLabel="Notes" />
                  </>
                ),
              },
              {
                key: 'items',
                label: 'Goods Received',
                forceRender: true,
                children: (
                  <Table
                    className="list-table"
                    rowKey="_id"
                    size="small"
                    bordered
                    pagination={false}
                    dataSource={dueLines as any[]}
                    columns={[
                      { title: 'Item', dataIndex: 'description' },
                      { title: 'Unit', dataIndex: 'unit', width: 80 },
                      { title: 'Ordered', dataIndex: 'quantity', width: 100, align: 'right', render: formatQuantity },
                      {
                        title: 'Received So Far',
                        dataIndex: 'receivedQuantity',
                        width: 130,
                        align: 'right',
                        render: formatQuantity,
                      },
                      {
                        title: 'Receiving Now',
                        key: 'receiving',
                        width: 140,
                        render: (_: unknown, line: any, index: number) => (
                          <>
                            <Form.Item name={['lines', index, 'orderLineId']} hidden noStyle><Input /></Form.Item>
                            <Form.Item name={['lines', index, 'receivedQuantity']} style={{ margin: 0 }}>
                              <InputNumber
                                min={0}
                                max={(line.quantity ?? 0) - (line.receivedQuantity ?? 0)}
                                precision={3}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          </>
                        ),
                      },
                      {
                        title: 'Rejected',
                        key: 'rejected',
                        width: 120,
                        render: (_: unknown, __: any, index: number) => (
                          <Form.Item name={['lines', index, 'rejectedQuantity']} style={{ margin: 0 }}>
                            <InputNumber min={0} precision={3} style={{ width: '100%' }} />
                          </Form.Item>
                        ),
                      },
                      {
                        title: 'Remarks',
                        key: 'remarks',
                        render: (_: unknown, __: any, index: number) => (
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
          <FormButtonsSaveCancel
            fullWidth
            handleCancel={() => history.push(paths.receiptsPath)}
            isFieldsTouched={!saving}
          />
        </Form>
      );
    }
  }

  return (
    <div className="purchasing-document">
      {orderPicker}
      {body}
    </div>
  );
};

export default NewReceipt;
