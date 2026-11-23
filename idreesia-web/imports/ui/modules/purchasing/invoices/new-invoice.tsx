import React, { useEffect, useState } from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import { parse } from 'query-string';
import { CombinedGraphQLErrors } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Collapse, Form, Modal } from 'antd';
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
import RecordSelect from '../common/record-select';
import TotalsSummary from '../common/totals-summary';
import VendorSelect from '../common/vendor-select';
import { PAGED_PURCHASING_ORDERS, PURCHASING_ORDER_BY_ID } from '../orders/gql';
import { default as paths } from '../submodule-paths';
import { CREATE_PURCHASING_INVOICE } from './gql';

const BILLABLE = ['approved', 'sent', 'partially-received', 'received'];

interface FormValues {
  vendorId?: string;
  orderId?: string;
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
  const [form] = Form.useForm<FormValues>();
  const [orderId, setOrderId] = useState<string | undefined>(presetOrderId);
  const [vendorId, setVendorId] = useState<string | undefined>();

  const { data } = useQuery(PURCHASING_ORDER_BY_ID, {
    variables: { _id: orderId ?? '' },
    skip: !orderId,
  });
  const order = data?.purchasingOrderById;
  const [createInvoice, { loading }] = useMutation(CREATE_PURCHASING_INVOICE, {
    refetchQueries: ['pagedPurchasingInvoices', 'purchasingOrderById', 'purchasingDashboard'],
  });

  // When an order is chosen, bill what was received and not yet invoiced.
  useEffect(() => {
    if (!order) return;
    setVendorId(order.vendorId ?? undefined);
    const lines = (order.lines ?? [])
      .filter((l): l is NonNullable<typeof l> => l != null)
      .map((l) => ({
        l,
        quantity: Math.round(((l.receivedQuantity ?? 0) - (l.invoicedQuantity ?? 0)) * 1000) / 1000,
      }))
      .filter(({ quantity }) => quantity > 0)
      .map(({ l, quantity }) => ({
        orderLineId: l._id,
        catalogItemId: l.catalogItemId,
        catalogItemName: l.catalogItemId ? l.description : undefined,
        description: l.description,
        unit: l.unit,
        quantity,
        unitPrice: l.unitPrice,
        taxRate: l.taxRate,
      }));
    form.setFieldsValue({
      vendorId: order.vendorId ?? undefined,
      orderId: order._id ?? undefined,
      lines: lines.length > 0 ? lines : [{ quantity: 1, taxRate: 0 }],
    });
    // Only when a different order is loaded.
  }, [order?._id]);

  const submit = async (values: FormValues, allowOverBilling: boolean) => {
    const result = await createInvoice({
      variables: {
        vendorId: values.vendorId!,
        orderId: values.orderId,
        vendorInvoiceNo: values.vendorInvoiceNo!,
        invoiceDate: toDateInput(values.invoiceDate)!,
        dueDate: toDateInput(values.dueDate),
        notes: values.notes,
        allowOverBilling: allowOverBilling || undefined,
        lines: toPricedLineInput(values.lines),
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
        initialValues={{ lines: [{ quantity: 1, taxRate: 0 }], orderId: presetOrderId }}
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
                      disabled={!!order}
                      selected={order?.vendor}
                      onChange={(value) => {
                        setVendorId(value);
                        form.setFieldValue('orderId', undefined);
                        setOrderId(undefined);
                      }}
                    />
                  </Form.Item>
                  <Form.Item name="orderId" label="Purchase Order" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                    <RecordSelect
                      query={PAGED_PURCHASING_ORDERS}
                      dataKey="pagedPurchasingOrders"
                      variables={{ vendorId }}
                      filterRow={(o) => BILLABLE.includes(o.status)}
                      labelOf={(o) => (o.number ? `${o.number} - ${o.vendor?.name ?? ''}` : '')}
                      selected={order}
                      placeholder="Optional: the order this invoice bills"
                      onChange={(value) => {
                        setOrderId(value);
                        if (!value) form.setFieldValue('orderId', undefined);
                      }}
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
                  <LineItemsEditor variant="priced" showTax />
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
