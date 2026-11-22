import React, { useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Collapse, Descriptions, Empty, Form, Modal, Popconfirm, Space, Spin, Table, Tabs } from 'antd';
import dayjs from 'dayjs';

import { Permissions } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  DateField,
  FormButtonsSaveCancel,
  InputNumberField,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import AttachmentsTab from '../common/attachments-tab';
import HistoryTab from '../common/history-tab';
import LineItemsEditor, {
  computeLineTotals,
  toLineFormValues,
  toPricedLineInput,
  type LineFormValue,
} from '../common/line-items-editor';
import LinesTable from '../common/lines-table';
import { formatDate, formatMoney, toDateInput, toDayjs } from '../common/format';
import ReasonModal from '../common/reason-modal';
import { runAction } from '../common/run-action';
import StatusTag from '../common/status-tag';
import TotalsSummary from '../common/totals-summary';
import usePurchasingAccess from '../common/use-purchasing-access';
import VendorSelect from '../common/vendor-select';
import { PAGED_PURCHASING_INVOICES } from '../invoices/gql';
import { PAGED_PURCHASING_RECEIPTS } from '../receipts/gql';
import { default as paths } from '../submodule-paths';
import {
  APPROVE_PURCHASING_ORDER,
  CANCEL_PURCHASING_ORDER,
  CLOSE_PURCHASING_ORDER,
  CREATE_PURCHASING_ORDER,
  DELETE_PURCHASING_ORDER,
  MARK_PURCHASING_ORDER_SENT,
  PURCHASING_ORDER_BY_ID,
  REJECT_PURCHASING_ORDER,
  SUBMIT_PURCHASING_ORDER,
  UPDATE_PURCHASING_ORDER,
} from './gql';

const P = Permissions;
const REFETCH = ['purchasingOrderById', 'pagedPurchasingOrders', 'purchasingDashboard', 'purchasingRequisitionById'];

interface FormValues {
  vendorId?: string;
  orderDate?: dayjs.Dayjs | null;
  expectedDeliveryDate?: dayjs.Dayjs | null;
  deliveryAddress?: string;
  paymentTermsDays?: number | null;
  notes?: string;
  discount?: number | null;
  shipping?: number | null;
  lines: LineFormValue[];
}

const RECEIVING = ['approved', 'sent', 'partially-received'];
const INVOICING = ['approved', 'sent', 'partially-received', 'received'];

const OrderPage = ({ match, history }: RouteComponentProps<{ orderId?: string }>) => {
  const id = match.params.orderId;
  const isNew = !id;
  const { can } = usePurchasingAccess();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const { data, loading } = useQuery(PURCHASING_ORDER_BY_ID, {
    variables: { _id: id ?? '' },
    skip: isNew,
  });
  const order = data?.purchasingOrderById;
  const receipts = useQuery(PAGED_PURCHASING_RECEIPTS, {
    variables: { orderId: id, pageIndex: 0, pageSize: 50 },
    skip: isNew || !can(P.PURCHASING_VIEW_RECEIPTS, P.PURCHASING_MANAGE_RECEIPTS),
  });
  const invoices = useQuery(PAGED_PURCHASING_INVOICES, {
    variables: { orderId: id, pageIndex: 0, pageSize: 50 },
    skip: isNew || !can(P.PURCHASING_VIEW_INVOICES, P.PURCHASING_MANAGE_INVOICES),
  });

  const [createOrder] = useMutation(CREATE_PURCHASING_ORDER, { refetchQueries: REFETCH });
  const [updateOrder] = useMutation(UPDATE_PURCHASING_ORDER, { refetchQueries: REFETCH });
  const [submitOrder] = useMutation(SUBMIT_PURCHASING_ORDER, { refetchQueries: REFETCH });
  const [approveOrder] = useMutation(APPROVE_PURCHASING_ORDER, { refetchQueries: REFETCH });
  const [rejectOrder] = useMutation(REJECT_PURCHASING_ORDER, { refetchQueries: REFETCH });
  const [markSent] = useMutation(MARK_PURCHASING_ORDER_SENT, { refetchQueries: REFETCH });
  const [closeOrder] = useMutation(CLOSE_PURCHASING_ORDER, { refetchQueries: REFETCH });
  const [cancelOrder] = useMutation(CANCEL_PURCHASING_ORDER, { refetchQueries: REFETCH });
  const [deleteOrder] = useMutation(DELETE_PURCHASING_ORDER, { refetchQueries: REFETCH });

  useDynamicBreadcrumbs(['Purchasing', 'Purchase Orders', isNew ? 'New' : order?.number || '']);

  if (!isNew && loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!isNew && !order?._id) {
    return <Empty description="Purchase order not found" style={{ padding: '80px 0' }} />;
  }

  const status = order?.status ?? '';
  const editable = isNew || status === 'draft';
  const canManage = can(P.PURCHASING_MANAGE_ORDERS);
  const canApprove = can(P.PURCHASING_APPROVE_ORDERS);

  const handleFinish = async (values: FormValues) => {
    const common = {
      vendorId: values.vendorId!,
      orderDate: toDateInput(values.orderDate)!,
      expectedDeliveryDate: toDateInput(values.expectedDeliveryDate),
      deliveryAddress: values.deliveryAddress,
      paymentTermsDays: values.paymentTermsDays ?? undefined,
      notes: values.notes,
      discount: values.discount ?? undefined,
      shipping: values.shipping ?? undefined,
      lines: toPricedLineInput(values.lines),
    };
    if (isNew) {
      const result = await createOrder({ variables: common }).catch((error: Error) => {
        Modal.error({ title: 'Could not save', content: error.message });
        return null;
      });
      const newId = result?.data?.createPurchasingOrder?._id;
      if (newId) history.replace(paths.orderEditPath(newId));
      return;
    }
    const ok = await runAction(
      updateOrder({ variables: { _id: order!._id!, version: order!.version!, ...common } }),
      'Order saved'
    );
    if (ok) setIsFieldsTouched(false);
  };

  const totalsOf = (values: Pick<FormValues, 'lines' | 'discount' | 'shipping'>) => {
    const { subtotal, taxTotal } = computeLineTotals(values.lines, 'priced');
    const discount = values.discount ?? 0;
    const shipping = values.shipping ?? 0;
    return {
      subtotal,
      taxTotal,
      discount,
      shipping,
      total: Math.round((subtotal + taxTotal - discount + shipping) * 100) / 100,
    };
  };

  const editableForm = (
    <Form
      key={`${id ?? 'new'}-${order?.version ?? 0}`}
      layout="horizontal"
      initialValues={{
        lines: isNew ? [{ quantity: 1, taxRate: 0 }] : toLineFormValues(order?.lines),
        vendorId: order?.vendorId,
        discount: order?.discount ?? 0,
        shipping: order?.shipping ?? 0,
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
            label: 'General',
            forceRender: true,
            children: (
              <>
                <Form.Item
                  name="vendorId"
                  label="Vendor"
                  rules={[{ required: true, message: 'Please choose a vendor.' }]}
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 14 }}
                >
                  <VendorSelect selected={order?.vendor} allowClear={false} />
                </Form.Item>
                <DateField
                  fieldName="orderDate"
                  fieldLabel="Order Date"
                  initialValue={toDayjs(order?.orderDate) ?? (isNew ? dayjs() : null)}
                  required
                  requiredMessage="Please choose the order date."
                />
                <DateField
                  fieldName="expectedDeliveryDate"
                  fieldLabel="Expected Delivery"
                  initialValue={toDayjs(order?.expectedDeliveryDate)}
                  allowClear
                />
                <InputTextAreaField
                  fieldName="deliveryAddress"
                  fieldLabel="Delivery Address"
                  initialValue={order?.deliveryAddress}
                />
                <InputNumberField
                  fieldName="paymentTermsDays"
                  fieldLabel="Payment Terms (days)"
                  initialValue={order?.paymentTermsDays}
                  minValue={0}
                  precision={0}
                />
                <InputTextAreaField fieldName="notes" fieldLabel="Notes" initialValue={order?.notes} />
              </>
            ),
          },
          {
            key: 'items',
            label: 'Items',
            forceRender: true,
            children: (
              <>
                <LineItemsEditor variant="priced" showTax />
                <div style={{ height: 12 }} />
                <Space size={24} wrap>
                  <InputNumberField
                    fieldName="discount"
                    fieldLabel="Discount"
                    minValue={0}
                    precision={2}
                    fieldLayout={{ labelCol: { span: 10 }, wrapperCol: { span: 14 } }}
                  />
                  <InputNumberField
                    fieldName="shipping"
                    fieldLabel="Shipping"
                    minValue={0}
                    precision={2}
                    fieldLayout={{ labelCol: { span: 10 }, wrapperCol: { span: 14 } }}
                  />
                </Space>
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldsValue }) => <TotalsSummary {...totalsOf(getFieldsValue(['lines', 'discount', 'shipping']))} />}
                </Form.Item>
              </>
            ),
          },
        ]}
      />
      {canManage ? (
        <FormButtonsSaveCancel
          fullWidth
          handleCancel={() => history.push(paths.ordersPath)}
          isFieldsTouched={isFieldsTouched || isNew}
        />
      ) : null}
    </Form>
  );

  const readOnlyView = order ? (
    <>
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 12 }}>
        <Descriptions.Item label="Vendor">{order.vendor?.name}</Descriptions.Item>
        <Descriptions.Item label="Order Date">{formatDate(order.orderDate)}</Descriptions.Item>
        <Descriptions.Item label="Expected Delivery">{formatDate(order.expectedDeliveryDate)}</Descriptions.Item>
        <Descriptions.Item label="Payment Terms">
          {order.paymentTermsDays != null ? `${order.paymentTermsDays} days` : ''}
        </Descriptions.Item>
        <Descriptions.Item label="Delivery Address" span={2}>{order.deliveryAddress}</Descriptions.Item>
        <Descriptions.Item label="Notes" span={2}>{order.notes}</Descriptions.Item>
        {order.requisitionId ? (
          <Descriptions.Item label="Requisition" span={2}>
            <Link to={paths.requisitionEditPath(order.requisitionId)}>View requisition</Link>
          </Descriptions.Item>
        ) : null}
        {order.quoteId ? (
          <Descriptions.Item label="Quote" span={2}>
            <Link to={paths.quoteEditPath(order.quoteId)}>View quote</Link>
          </Descriptions.Item>
        ) : null}
      </Descriptions>
      <LinesTable lines={order.lines} price="unitPrice" showTax showProgress />
      <div style={{ height: 8 }} />
      <TotalsSummary
        subtotal={order.subtotal ?? 0}
        taxTotal={order.taxTotal ?? 0}
        discount={order.discount ?? 0}
        shipping={order.shipping ?? 0}
        total={order.total ?? 0}
      />
    </>
  ) : null;

  const receiptRows = (receipts.data?.pagedPurchasingReceipts?.data ?? []).filter((r) => r?._id);
  const invoiceRows = (invoices.data?.pagedPurchasingInvoices?.data ?? []).filter((i) => i?._id);

  const items = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <div className="purchasing-document">
          {order?.rejectionReason && status === 'draft' ? (
            <p style={{ color: '#b42318' }}>Returned for changes: {order.rejectionReason}</p>
          ) : null}
          {editable ? editableForm : readOnlyView}
          {order ? (
            <>
              <div style={{ height: 12 }} />
              <AuditInfo record={order} />
            </>
          ) : null}
        </div>
      ),
    },
    ...(!isNew && can(P.PURCHASING_VIEW_RECEIPTS, P.PURCHASING_MANAGE_RECEIPTS)
      ? [
          {
            key: 'receipts',
            label: `Receipts (${receiptRows.length})`,
            children: (
              <Table
                className="list-table"
                rowKey="_id"
                size="middle"
                bordered
                pagination={false}
                dataSource={receiptRows as any[]}
                columns={[
                  {
                    title: 'Number',
                    dataIndex: 'number',
                    render: (text: string, record: any) => <Link to={paths.receiptViewPath(record._id)}>{text}</Link>,
                  },
                  { title: 'Date', dataIndex: 'receivedDate', render: formatDate },
                  { title: 'Delivery Note', dataIndex: 'deliveryNoteNo' },
                  { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusTag status={s} /> },
                ]}
              />
            ),
          },
        ]
      : []),
    ...(!isNew && can(P.PURCHASING_VIEW_INVOICES, P.PURCHASING_MANAGE_INVOICES)
      ? [
          {
            key: 'invoices',
            label: `Invoices (${invoiceRows.length})`,
            children: (
              <Table
                className="list-table"
                rowKey="_id"
                size="middle"
                bordered
                pagination={false}
                dataSource={invoiceRows as any[]}
                columns={[
                  {
                    title: 'Number',
                    dataIndex: 'number',
                    render: (text: string, record: any) => <Link to={paths.invoiceViewPath(record._id)}>{text}</Link>,
                  },
                  { title: 'Vendor Invoice', dataIndex: 'vendorInvoiceNo' },
                  { title: 'Date', dataIndex: 'invoiceDate', render: formatDate },
                  { title: 'Total', dataIndex: 'total', align: 'right' as const, render: formatMoney },
                  { title: 'Balance', dataIndex: 'balance', align: 'right' as const, render: formatMoney },
                  { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusTag status={s} /> },
                ]}
              />
            ),
          },
        ]
      : []),
    ...(!isNew
      ? [
          {
            key: 'attachments',
            label: 'Attachments',
            children: <AttachmentsTab ownerType="order" ownerId={order!._id!} canManage={canManage} />,
          },
        ]
      : []),
    ...(!isNew && can(P.PURCHASING_VIEW_AUDIT_LOGS)
      ? [{ key: 'history', label: 'History', children: <HistoryTab entityId={order!._id!} /> }]
      : []),
  ];

  const orderId = order?._id ?? '';
  const actions = !order ? null : (
    <div className="purchasing-actions-bar">
      <Space wrap>
        {status !== 'draft' ? (
          <Button onClick={() => history.push(paths.orderPrintPath(orderId))}>Print</Button>
        ) : null}
        {status === 'draft' && canManage ? (
          <Button type="primary" onClick={() => runAction(submitOrder({ variables: { _id: orderId } }), 'Order submitted for approval')}>
            Submit for Approval
          </Button>
        ) : null}
        {status === 'pending-approval' && canApprove ? (
          <>
            <Button type="primary" onClick={() => runAction(approveOrder({ variables: { _id: orderId } }), 'Order approved')}>
              Approve
            </Button>
            <Button danger onClick={() => setRejecting(true)}>Return to Draft</Button>
          </>
        ) : null}
        {status === 'approved' && canManage ? (
          <Button onClick={() => runAction(markSent({ variables: { _id: orderId } }), 'Order marked as sent')}>
            Mark as Sent
          </Button>
        ) : null}
        {RECEIVING.includes(status) && can(P.PURCHASING_MANAGE_RECEIPTS) ? (
          <Button type="primary" onClick={() => history.push(`${paths.receiptNewPath}?orderId=${orderId}`)}>
            Receive Goods
          </Button>
        ) : null}
        {INVOICING.includes(status) && can(P.PURCHASING_MANAGE_INVOICES) ? (
          <Button onClick={() => history.push(`${paths.invoiceNewPath}?orderId=${orderId}`)}>Record Invoice</Button>
        ) : null}
        {['partially-received', 'received'].includes(status) && canManage ? (
          <Popconfirm
            title="Close this order? Nothing more can be received."
            okText="Close"
            cancelText="No"
            onConfirm={() => runAction(closeOrder({ variables: { _id: orderId } }), 'Order closed')}
          >
            <Button>Close Order</Button>
          </Popconfirm>
        ) : null}
        {['draft', 'pending-approval', 'approved', 'sent'].includes(status) && canManage ? (
          <Popconfirm
            title="Cancel this order?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => runAction(cancelOrder({ variables: { _id: orderId } }), 'Order cancelled')}
          >
            <Button danger>Cancel Order</Button>
          </Popconfirm>
        ) : null}
        {status === 'draft' && canManage ? (
          <Popconfirm
            title="Delete this draft?"
            okText="Yes"
            cancelText="No"
            onConfirm={async () => {
              const ok = await runAction(deleteOrder({ variables: { _id: orderId } }), 'Order deleted');
              if (ok) history.replace(paths.ordersPath);
            }}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        ) : null}
      </Space>
    </div>
  );

  return (
    <>
      {order ? (
        <Space style={{ marginBottom: 12 }} size={12}>
          <strong>{order.number}</strong>
          <StatusTag status={status} />
          <span>{order.vendor?.name}</span>
          <span style={{ color: '#667085' }}>{formatMoney(order.total)}</span>
        </Space>
      ) : null}
      {actions}
      <Tabs items={items} />
      <ReasonModal
        open={rejecting}
        title="Return Order to Draft"
        okText="Return"
        onCancel={() => setRejecting(false)}
        onOk={async (reason) => {
          const ok = await runAction(
            rejectOrder({ variables: { _id: orderId, reason } }),
            'Order returned to draft'
          );
          if (ok) setRejecting(false);
        }}
      />
    </>
  );
};

export default OrderPage;
