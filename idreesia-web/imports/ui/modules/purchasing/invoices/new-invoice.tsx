import React, { useEffect, useState } from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import { parse } from 'query-string';
import { CombinedGraphQLErrors } from '@apollo/client';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { Collapse, Form, Modal, Select } from 'antd';
import dayjs from 'dayjs';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';

import { toDateInput } from '../common/format';
import LineItemsEditor, {
  computeLineTotals,
  toPricedLineInput,
  type LineFormValue,
} from '../common/line-items-editor';
import TotalsSummary from '../common/totals-summary';
import VendorSelect from '../common/vendor-select';
import { PAGED_PURCHASING_ORDERS, PURCHASING_ORDER_BY_ID } from '../orders/gql';
import { default as paths } from '../submodule-paths';
import { CREATE_PURCHASING_INVOICE } from './gql';

const BILLABLE = ['approved', 'sent', 'partially-received', 'received'];

interface FormValues {
  vendorId?: string;
  orderIds?: string[];
  vendorInvoiceNo?: string;
  invoiceDate?: dayjs.Dayjs | null;
  dueDate?: dayjs.Dayjs | null;
  notes?: string;
  lines: LineFormValue[];
}

const isOverBilled = (error: unknown) =>
  CombinedGraphQLErrors.is(error) && error.errors.some((e) => e.extensions?.overBilled === true);

const NewInvoice = ({ history, location }: RouteComponentProps) => {
  useDynamicBreadcrumbs(['Purchasing', 'Invoices', 'New']);
  const presetOrderId = String(parse(location.search).orderId ?? '') || undefined;
  const client = useApolloClient();
  const [form] = Form.useForm<FormValues>();
  const vendorId = Form.useWatch('vendorId', form);
  const orderIds: string[] = Form.useWatch('orderIds', form) ?? [];
  // The orders whose lines were already added, so choosing another one only adds its lines.
  const [presetVendor, setPresetVendor] = useState<{ _id?: string | null; name?: string | null } | null>(null);
  const [loadedOrders, setLoadedOrders] = useState<Record<string, string>>({});

  // One vendor bill can cover several of the vendor's orders.
  const orders = useQuery(PAGED_PURCHASING_ORDERS, {
    variables: { vendorId, pageIndex: 0, pageSize: 100 },
    skip: !vendorId,
  });
  const billable = (orders.data?.pagedPurchasingOrders?.data ?? []).filter(
    (o) => o?._id && BILLABLE.includes(o.status ?? '')
  );

  const [createInvoice, { loading }] = useMutation(CREATE_PURCHASING_INVOICE, {
    refetchQueries: ['pagedPurchasingInvoices', 'purchasingOrderById', 'purchasingDashboard'],
  });

  // From the order's page ("Record Invoice"): start with that order.
  useEffect(() => {
    if (!presetOrderId) return;
    client.query({ query: PURCHASING_ORDER_BY_ID, variables: { _id: presetOrderId } }).then((result) => {
      const order = result.data?.purchasingOrderById;
      if (order?._id) setPresetVendor(order.vendor ?? null);
      if (order?._id) form.setFieldsValue({ vendorId: order.vendorId ?? undefined, orderIds: [order._id] });
    });
    // Only once.
  }, []);

  // Keep the lines in step with the chosen orders: a newly chosen order brings
  // what was received and not yet invoiced; an order taken out drops its lines.
  const orderKey = orderIds.join(',');
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      const current = (form.getFieldValue('lines') ?? []) as LineFormValue[];
      let lines = current.filter((l) => !l.orderId || orderIds.includes(l.orderId));
      const names = { ...loadedOrders };
      let changed = lines.length !== current.length;
      for (const id of orderIds) {
        if (names[id]) continue;
        const result = await client.query({ query: PURCHASING_ORDER_BY_ID, variables: { _id: id } });
        const order = result.data?.purchasingOrderById;
        if (cancelled || !order) return;
        const orderLines = (order.lines ?? []).filter((l): l is NonNullable<typeof l> => l != null);
        const due = orderLines.filter((l) => (l.receivedQuantity ?? 0) - (l.invoicedQuantity ?? 0) > 0);
        const toBill = due.length > 0 ? due : orderLines;
        lines = [
          ...lines,
          ...toBill.map((l) => ({
            orderId: order._id,
            orderLineId: l._id,
            internalCatalogId: l.internalCatalogId,
            description: `${order.number}: ${l.description}`,
            unit: l.unit,
            quantity:
              due.length > 0
                ? Math.round(((l.receivedQuantity ?? 0) - (l.invoicedQuantity ?? 0)) * 1000) / 1000
                : l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate,
          })),
        ];
        names[id] = order.number ?? id;
        changed = true;
      }
      if (cancelled || !changed) return;
      setLoadedOrders(names);
      form.setFieldValue('lines', lines);
    };
    sync();
    return () => {
      cancelled = true;
    };
  }, [orderKey]);

  const submit = async (values: FormValues, allowOverBilling: boolean) => {
    const result = await createInvoice({
      variables: {
        vendorId: values.vendorId!,
        vendorInvoiceNo: values.vendorInvoiceNo!,
        invoiceDate: toDateInput(values.invoiceDate)!,
        dueDate: toDateInput(values.dueDate),
        notes: values.notes,
        allowOverBilling: allowOverBilling || undefined,
        // The item and unit come from the order line (the form shows the order number too).
        lines: toPricedLineInput(values.lines).map((l) => ({
          ...l,
          description: undefined,
          unit: undefined,
        })),
      },
    }).catch((error: Error) => {
      if (!allowOverBilling && isOverBilled(error)) {
        Modal.confirm({
          title: 'Billed for more than was received',
          content: `${error.message} Record it anyway? It will be marked as disputed.`,
          okText: 'Record as Disputed',
          onOk: () => submit(values, true),
        });
      } else {
        Modal.error({ title: 'Could not save the invoice', content: error.message });
      }
      return null;
    });
    const id = result?.data?.createPurchasingInvoice?._id;
    if (id) history.replace(paths.invoiceViewPath(id));
  };

  const totalOf = (lines: LineFormValue[] | undefined) => computeLineTotals(lines, 'priced');

  return (
    <div className="purchasing-document">
      <Form
        form={form}
        layout="horizontal"
        initialValues={{ lines: [] }}
        onFinish={(values) => submit(values, false)}
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
                    <VendorSelect
                      allowClear={false}
                      selected={presetVendor}
                      onChange={() => {
                        form.setFieldsValue({ orderIds: [], lines: [] });
                        setLoadedOrders({});
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="orderIds"
                    label="Purchase Orders"
                    rules={[{ required: true, message: 'Choose the orders this invoice bills.' }]}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 14 }}
                  >
                    <Select
                      mode="multiple"
                      disabled={!vendorId}
                      loading={orders.loading}
                      placeholder="The vendor's orders this invoice bills"
                      optionFilterProp="label"
                      options={billable.map((o) => ({ value: o!._id as string, label: o!.number ?? '' }))}
                    />
                  </Form.Item>
                  <InputTextField
                    fieldName="vendorInvoiceNo"
                    fieldLabel="Vendor Invoice No."
                    required
                    requiredMessage="Please input the vendor's invoice number."
                  />
                  <DateField
                    fieldName="invoiceDate"
                    fieldLabel="Invoice Date"
                    initialValue={dayjs()}
                    required
                    requiredMessage="Please choose the invoice date."
                  />
                  <DateField fieldName="dueDate" fieldLabel="Due Date" allowClear />
                  <InputTextAreaField fieldName="notes" fieldLabel="Notes" />
                </>
              ),
            },
            {
              key: 'items',
              label: 'Items',
              forceRender: true,
              children: (
                <>
                  <LineItemsEditor variant="priced" showTax fixedLines allowRemove />
                  <Form.Item noStyle shouldUpdate>
                    {({ getFieldValue }) => {
                      const totals = totalOf(getFieldValue('lines'));
                      return <TotalsSummary subtotal={totals.subtotal} taxTotal={totals.taxTotal} total={totals.total} />;
                    }}
                  </Form.Item>
                </>
              ),
            },
          ]}
        />
        <FormButtonsSaveCancel
          fullWidth
          handleCancel={() => history.push(paths.invoicesPath)}
          isFieldsTouched={!loading}
        />
      </Form>
    </div>
  );
};

export default NewInvoice;
