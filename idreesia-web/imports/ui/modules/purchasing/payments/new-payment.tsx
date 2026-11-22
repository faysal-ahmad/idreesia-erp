import React, { useEffect, useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { parse } from 'query-string';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Collapse, Empty, Form, InputNumber, Modal, Select, Table } from 'antd';
import dayjs from 'dayjs';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';

import { formatDate, formatMoney, toDateInput } from '../common/format';
import StatusTag from '../common/status-tag';
import VendorSelect from '../common/vendor-select';
import { PAGED_PURCHASING_INVOICES, PURCHASING_INVOICE_BY_ID } from '../invoices/gql';
import { default as paths } from '../submodule-paths';
import { METHOD_LABELS } from './list';
import { POST_PURCHASING_PAYMENT } from './gql';

interface FormValues {
  paymentDate?: dayjs.Dayjs | null;
  method?: string;
  reference?: string;
  notes?: string;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

const NewPayment = ({ history, location }: RouteComponentProps) => {
  useDynamicBreadcrumbs(['Purchasing', 'Payments', 'New']);
  const presetInvoiceId = String(parse(location.search).invoiceId ?? '') || undefined;
  const [form] = Form.useForm<FormValues>();
  const [vendorId, setVendorId] = useState<string | undefined>();
  // What is being paid now, per invoice.
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  const preset = useQuery(PURCHASING_INVOICE_BY_ID, {
    variables: { _id: presetInvoiceId ?? '' },
    skip: !presetInvoiceId,
  });
  const presetInvoice = preset.data?.purchasingInvoiceById;
  useEffect(() => {
    if (!presetInvoice?._id) return;
    setVendorId(presetInvoice.vendorId ?? undefined);
    setAmounts({ [presetInvoice._id]: presetInvoice.balance ?? 0 });
  }, [presetInvoice?._id, presetInvoice?.vendorId, presetInvoice?.balance]);

  const { data, loading } = useQuery(PAGED_PURCHASING_INVOICES, {
    variables: { vendorId, pageIndex: 0, pageSize: 200 },
    skip: !vendorId,
  });
  const owed = (data?.pagedPurchasingInvoices?.data ?? []).filter(
    (i): i is NonNullable<typeof i> =>
      i != null && ['unpaid', 'partially-paid'].includes(i.status ?? '') && (i.balance ?? 0) > 0
  );

  const [postPayment, { loading: saving }] = useMutation(POST_PURCHASING_PAYMENT, {
    refetchQueries: ['pagedPurchasingPayments', 'pagedPurchasingInvoices', 'purchasingInvoiceById', 'purchasingDashboard'],
  });

  const allocations = Object.entries(amounts)
    .filter(([, amount]) => amount > 0)
    .map(([invoiceId, amount]) => ({ invoiceId, amount }));
  const total = round2(allocations.reduce((sum, a) => sum + a.amount, 0));

  const handleFinish = async (values: FormValues) => {
    const result = await postPayment({
      variables: {
        vendorId: vendorId!,
        paymentDate: toDateInput(values.paymentDate)!,
        method: values.method!,
        reference: values.reference,
        notes: values.notes,
        allocations,
      },
    }).catch((error: Error) => {
      Modal.error({ title: 'Could not save the payment', content: error.message });
      return null;
    });
    const id = result?.data?.postPurchasingPayment?._id;
    if (id) history.replace(paths.paymentViewPath(id));
  };

  return (
    <div className="purchasing-document">
      <Form
        form={form}
        layout="horizontal"
        initialValues={{ method: 'bank-transfer' }}
        onFinish={handleFinish}
      >
        <Collapse
          className="visitor-form-sections"
          defaultActiveKey={['general', 'invoices']}
          items={[
            {
              key: 'general',
              label: 'General',
              forceRender: true,
              children: (
                <>
                  <Form.Item label="Vendor" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} required>
                    <VendorSelect
                      allowClear={false}
                      includeInactive
                      value={vendorId}
                      selected={presetInvoice?.vendor}
                      disabled={!!presetInvoiceId}
                      onChange={(value) => {
                        setVendorId(value);
                        setAmounts({});
                      }}
                    />
                  </Form.Item>
                  <DateField
                    fieldName="paymentDate"
                    fieldLabel="Payment Date"
                    initialValue={dayjs()}
                    required
                    requiredMessage="Please choose the payment date."
                  />
                  <Form.Item
                    name="method"
                    label="Method"
                    rules={[{ required: true, message: 'Please choose the method.' }]}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 14 }}
                  >
                    <Select
                      options={Object.entries(METHOD_LABELS).map(([value, label]) => ({ value, label }))}
                      style={{ width: 240 }}
                    />
                  </Form.Item>
                  <InputTextField fieldName="reference" fieldLabel="Reference" placeholder="Cheque or transfer number" />
                  <InputTextAreaField fieldName="notes" fieldLabel="Notes" />
                </>
              ),
            },
            {
              key: 'invoices',
              label: 'Invoices to Pay',
              forceRender: true,
              children: !vendorId ? (
                <Empty description="Choose a vendor to see what is owed." />
              ) : (
                <>
                  <Table
                    className="list-table"
                    rowKey="_id"
                    size="small"
                    bordered
                    loading={loading}
                    pagination={false}
                    dataSource={owed as any[]}
                    locale={{ emptyText: 'Nothing is owed to this vendor.' }}
                    columns={[
                      {
                        title: 'Invoice',
                        dataIndex: 'number',
                        render: (text: string, record: any) => (
                          <Link to={paths.invoiceViewPath(record._id)}>
                            {text} ({record.vendorInvoiceNo})
                          </Link>
                        ),
                      },
                      { title: 'Due', dataIndex: 'dueDate', width: 120, render: formatDate },
                      { title: 'Status', dataIndex: 'status', width: 130, render: (s: string) => <StatusTag status={s} /> },
                      { title: 'Total', dataIndex: 'total', width: 120, align: 'right', render: formatMoney },
                      { title: 'Owed', dataIndex: 'balance', width: 120, align: 'right', render: formatMoney },
                      {
                        title: 'Pay Now',
                        key: 'pay',
                        width: 220,
                        render: (_: unknown, record: any) => (
                          <>
                            <InputNumber
                              min={0}
                              max={record.balance}
                              precision={2}
                              value={amounts[record._id] ?? 0}
                              onChange={(value) =>
                                setAmounts((prev) => ({ ...prev, [record._id]: Number(value ?? 0) }))
                              }
                            />
                            <Button
                              type="link"
                              onClick={() => setAmounts((prev) => ({ ...prev, [record._id]: record.balance }))}
                            >
                              In full
                            </Button>
                          </>
                        ),
                      },
                    ]}
                  />
                  <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 600 }}>
                    Total payment: {formatMoney(total)}
                  </div>
                </>
              ),
            },
          ]}
        />
        <FormButtonsSaveCancel
          fullWidth
          handleCancel={() => history.push(paths.paymentsPath)}
          isFieldsTouched={!!vendorId && total > 0 && !saving}
        />
      </Form>
    </div>
  );
};

export default NewPayment;
