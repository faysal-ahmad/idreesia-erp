import React, { useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Descriptions, Empty, Form, Modal, Popconfirm, Space, Spin, Tabs, Tag } from 'antd';

import { Permissions } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { DateField, InputTextAreaField, InputTextField } from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import AttachmentsTab from '../common/attachments-tab';
import HistoryTab from '../common/history-tab';
import LinesTable from '../common/lines-table';
import { formatDate, formatMoney, toDateInput, toDayjs } from '../common/format';
import { runAction } from '../common/run-action';
import StatusTag from '../common/status-tag';
import TotalsSummary from '../common/totals-summary';
import usePurchasingAccess from '../common/use-purchasing-access';
import { default as paths } from '../submodule-paths';
import {
  PURCHASING_INVOICE_BY_ID,
  SET_PURCHASING_INVOICE_DISPUTED,
  UPDATE_PURCHASING_INVOICE,
  VOID_PURCHASING_INVOICE,
} from './gql';

const P = Permissions;
const REFETCH = ['purchasingInvoiceById', 'pagedPurchasingInvoices', 'purchasingOrderById', 'purchasingDashboard'];

const InvoicePage = ({ match, history }: RouteComponentProps<{ invoiceId: string }>) => {
  const { invoiceId } = match.params;
  const { can } = usePurchasingAccess();
  const [editing, setEditing] = useState(false);
  const [editForm] = Form.useForm();

  const { data, loading } = useQuery(PURCHASING_INVOICE_BY_ID, { variables: { _id: invoiceId } });
  const invoice = data?.purchasingInvoiceById;
  const [updateInvoice, { loading: updating }] = useMutation(UPDATE_PURCHASING_INVOICE, { refetchQueries: REFETCH });
  const [setDisputed] = useMutation(SET_PURCHASING_INVOICE_DISPUTED, { refetchQueries: REFETCH });
  const [voidInvoice] = useMutation(VOID_PURCHASING_INVOICE, { refetchQueries: REFETCH });

  useDynamicBreadcrumbs(['Purchasing', 'Invoices', invoice?.number || '']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!invoice?._id) return <Empty description="Invoice not found" style={{ padding: '80px 0' }} />;

  const status = invoice.status ?? '';
  const open = status !== 'voided';
  const canManage = can(P.PURCHASING_MANAGE_INVOICES);

  const items = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <div className="purchasing-document">
          <Descriptions bordered size="small" column={2} style={{ marginBottom: 12 }}>
            <Descriptions.Item label="Vendor">{invoice.vendor?.name}</Descriptions.Item>
            <Descriptions.Item label="Vendor Invoice No.">{invoice.vendorInvoiceNo}</Descriptions.Item>
            <Descriptions.Item label="Invoice Date">{formatDate(invoice.invoiceDate)}</Descriptions.Item>
            <Descriptions.Item label="Due Date">{formatDate(invoice.dueDate)}</Descriptions.Item>
            <Descriptions.Item label="Order">
              {invoice.order?._id ? <Link to={paths.orderEditPath(invoice.order._id)}>{invoice.order.number}</Link> : ''}
            </Descriptions.Item>
            <Descriptions.Item label="Paid">
              {formatMoney(invoice.paidAmount)} (balance {formatMoney(invoice.balance)})
            </Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>{invoice.notes}</Descriptions.Item>
          </Descriptions>
          <LinesTable lines={invoice.lines} price="unitPrice" showTax />
          <div style={{ height: 8 }} />
          <TotalsSummary subtotal={invoice.subtotal ?? 0} taxTotal={invoice.taxTotal ?? 0} total={invoice.total ?? 0} />
          <div style={{ height: 12 }} />
          <AuditInfo record={invoice} />
        </div>
      ),
    },
    {
      key: 'attachments',
      label: 'Attachments',
      children: <AttachmentsTab ownerType="invoice" ownerId={invoice._id!} canManage={canManage} />,
    },
    ...(can(P.PURCHASING_VIEW_AUDIT_LOGS)
      ? [{ key: 'history', label: 'History', children: <HistoryTab entityId={invoice._id!} /> }]
      : []),
  ];

  return (
    <>
      <Space style={{ marginBottom: 12 }} size={12}>
        <strong>{invoice.number}</strong>
        <StatusTag status={status} />
        {invoice.isDisputed ? <Tag color="error">Disputed</Tag> : null}
        <span style={{ color: '#667085' }}>{formatMoney(invoice.total)}</span>
      </Space>
      {open ? (
        <div className="purchasing-actions-bar">
          <Space wrap>
            {['unpaid', 'partially-paid'].includes(status) && can(P.PURCHASING_MANAGE_PAYMENTS) ? (
              <Button type="primary" onClick={() => history.push(`${paths.paymentNewPath}?invoiceId=${invoice._id}`)}>
                Record Payment
              </Button>
            ) : null}
            {canManage ? (
              <>
                <Button
                  onClick={() => {
                    editForm.setFieldsValue({
                      vendorInvoiceNo: invoice.vendorInvoiceNo,
                      dueDate: toDayjs(invoice.dueDate),
                      notes: invoice.notes,
                    });
                    setEditing(true);
                  }}
                >
                  Edit Details
                </Button>
                <Button
                  onClick={() =>
                    runAction(
                      setDisputed({ variables: { _id: invoice._id!, isDisputed: !invoice.isDisputed } }),
                      invoice.isDisputed ? 'Dispute cleared' : 'Invoice marked as disputed'
                    )
                  }
                >
                  {invoice.isDisputed ? 'Clear Dispute' : 'Mark as Disputed'}
                </Button>
                {status === 'unpaid' ? (
                  <Popconfirm
                    title="Void this invoice?"
                    okText="Void"
                    cancelText="No"
                    onConfirm={() => runAction(voidInvoice({ variables: { _id: invoice._id! } }), 'Invoice voided')}
                  >
                    <Button danger>Void Invoice</Button>
                  </Popconfirm>
                ) : null}
              </>
            ) : null}
          </Space>
        </div>
      ) : null}
      <Tabs items={items} className={items.length === 1 ? 'purchasing-single-tab' : undefined} />

      <Modal
        title="Edit Invoice Details"
        open={editing}
        okText="Save"
        confirmLoading={updating}
        onCancel={() => setEditing(false)}
        onOk={() =>
          editForm.validateFields().then(async (values) => {
            const ok = await runAction(
              updateInvoice({
                variables: {
                  _id: invoice._id!,
                  vendorInvoiceNo: values.vendorInvoiceNo,
                  dueDate: toDateInput(values.dueDate)!,
                  notes: values.notes,
                },
              }),
              'Invoice saved'
            );
            if (ok) setEditing(false);
          })
        }
        destroyOnHidden
        forceRender
      >
        <Form form={editForm} layout="horizontal" preserve={false}>
          <InputTextField fieldName="vendorInvoiceNo" fieldLabel="Vendor Invoice No." required requiredMessage="Required" />
          <DateField fieldName="dueDate" fieldLabel="Due Date" required requiredMessage="Required" />
          <InputTextAreaField fieldName="notes" fieldLabel="Notes" />
        </Form>
      </Modal>
    </>
  );
};

export default InvoicePage;
