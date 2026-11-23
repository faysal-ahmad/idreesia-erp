import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import { parse } from 'query-string';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Collapse, Empty, Form, Modal, Popconfirm, Space, Spin, Tabs } from 'antd';
import dayjs from 'dayjs';

import { Permissions } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  InputTextField,
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
import { toDateInput, toDayjs } from '../common/format';
import RecordSelect from '../common/record-select';
import { runAction } from '../common/run-action';
import StatusTag from '../common/status-tag';
import TotalsSummary from '../common/totals-summary';
import usePurchasingAccess from '../common/use-purchasing-access';
import VendorSelect from '../common/vendor-select';
import { CREATE_PURCHASING_ORDER_FROM_QUOTE } from '../orders/gql';
import { PAGED_PURCHASING_REQUISITIONS } from '../requisitions/gql';
import { default as paths } from '../submodule-paths';
import {
  CREATE_PURCHASING_QUOTE,
  DELETE_PURCHASING_QUOTE,
  PURCHASING_QUOTE_BY_ID,
  REJECT_PURCHASING_QUOTE,
  SELECT_PURCHASING_QUOTE,
  UPDATE_PURCHASING_QUOTE,
} from './gql';

const P = Permissions;
const REFETCH = ['purchasingQuoteById', 'pagedPurchasingQuotes'];

interface FormValues {
  requisitionId?: string;
  vendorId?: string;
  reference?: string;
  quoteDate?: dayjs.Dayjs | null;
  validUntil?: dayjs.Dayjs | null;
  notes?: string;
  lines: LineFormValue[];
}

const QuotePage = ({ match, history, location }: RouteComponentProps<{ quoteId?: string }>) => {
  const id = match.params.quoteId;
  const isNew = !id;
  const presetRequisitionId = String(parse(location.search).requisitionId ?? '') || undefined;
  const { can } = usePurchasingAccess();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const { data, loading } = useQuery(PURCHASING_QUOTE_BY_ID, {
    variables: { _id: id ?? '' },
    skip: isNew,
  });
  const quote = data?.purchasingQuoteById;

  const [createQuote] = useMutation(CREATE_PURCHASING_QUOTE, { refetchQueries: REFETCH });
  const [updateQuote] = useMutation(UPDATE_PURCHASING_QUOTE, { refetchQueries: REFETCH });
  const [selectQuote] = useMutation(SELECT_PURCHASING_QUOTE, { refetchQueries: REFETCH });
  const [rejectQuote] = useMutation(REJECT_PURCHASING_QUOTE, { refetchQueries: REFETCH });
  const [deleteQuote] = useMutation(DELETE_PURCHASING_QUOTE, { refetchQueries: REFETCH });
  const [createOrder] = useMutation(CREATE_PURCHASING_ORDER_FROM_QUOTE, {
    refetchQueries: [...REFETCH, 'pagedPurchasingOrders', 'purchasingRequisitionById'],
  });

  useDynamicBreadcrumbs(['Purchasing', 'Quotes', isNew ? 'New' : quote?.vendor?.name || '']);

  if (!isNew && loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!isNew && !quote?._id) {
    return <Empty description="Quote not found" style={{ padding: '80px 0' }} />;
  }

  const status = quote?.status;
  const editable = isNew || status === 'received';
  const canManage = can(P.PURCHASING_MANAGE_ORDERS);

  const handleFinish = async (values: FormValues) => {
    const common = {
      requisitionId: values.requisitionId,
      vendorId: values.vendorId!,
      reference: values.reference,
      quoteDate: toDateInput(values.quoteDate)!,
      validUntil: toDateInput(values.validUntil),
      notes: values.notes,
      lines: toPricedLineInput(values.lines),
    };
    if (isNew) {
      const result = await createQuote({ variables: common }).catch((error: Error) => {
        Modal.error({ title: 'Could not save', content: error.message });
        return null;
      });
      const newId = result?.data?.createPurchasingQuote?._id;
      if (newId) history.replace(paths.quoteEditPath(newId));
      return;
    }
    const ok = await runAction(
      updateQuote({ variables: { _id: quote!._id!, version: quote!.version!, ...common } }),
      'Quote saved'
    );
    if (ok) setIsFieldsTouched(false);
  };

  const totalOf = (lines: LineFormValue[] | undefined) => computeLineTotals(lines, 'priced').total;

  const form = (
    <Form
      key={`${id ?? 'new'}-${quote?.version ?? 0}`}
      layout="horizontal"
      initialValues={{
        lines: isNew ? [{ quantity: 1 }] : toLineFormValues(quote?.lines),
        vendorId: quote?.vendorId,
        requisitionId: quote?.requisitionId ?? (isNew ? presetRequisitionId : undefined),
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
                  <VendorSelect selected={quote?.vendor} disabled={!editable} allowClear={false} />
                </Form.Item>
                <Form.Item name="requisitionId" label="Requisition" labelCol={{ span: 6 }} wrapperCol={{ span: 14 }}>
                  <RecordSelect
                    query={PAGED_PURCHASING_REQUISITIONS}
                    dataKey="pagedPurchasingRequisitions"
                    filterRow={(r) => r.status !== 'cancelled'}
                    labelOf={(r) => (r.number ? `${r.number} - ${r.title}` : '')}
                    placeholder="Optional: the requisition this quote is for"
                    disabled={!editable}
                  />
                </Form.Item>
                <InputTextField
                  fieldName="reference"
                  fieldLabel="Reference"
                  initialValue={quote?.reference}
                  disabled={!editable}
                />
                <DateField
                  fieldName="quoteDate"
                  fieldLabel="Quote Date"
                  initialValue={toDayjs(quote?.quoteDate) ?? (isNew ? dayjs() : null)}
                  required
                  requiredMessage="Please choose the quote date."
                  disabled={!editable}
                />
                <DateField
                  fieldName="validUntil"
                  fieldLabel="Valid Until"
                  initialValue={toDayjs(quote?.validUntil)}
                  disabled={!editable}
                  allowClear
                />
                <InputTextAreaField fieldName="notes" fieldLabel="Notes" initialValue={quote?.notes} />
              </>
            ),
          },
          {
            key: 'items',
            label: 'Items',
            forceRender: true,
            children: editable ? (
              <>
                <LineItemsEditor variant="priced" />
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldValue }) => (
                    <TotalsSummary
                      subtotal={totalOf(getFieldValue('lines'))}
                      total={totalOf(getFieldValue('lines'))}
                    />
                  )}
                </Form.Item>
              </>
            ) : (
              <>
                <LinesTable lines={quote?.lines} price="unitPrice" />
                <div style={{ height: 8 }} />
                <TotalsSummary subtotal={quote?.total ?? 0} total={quote?.total ?? 0} />
              </>
            ),
          },
        ]}
      />
      {editable && canManage ? (
        <FormButtonsSaveCancel
          fullWidth
          handleCancel={() => history.push(paths.quotesPath)}
          isFieldsTouched={isFieldsTouched || isNew}
        />
      ) : null}
    </Form>
  );

  const items = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <div className="purchasing-document">
          {form}
          {quote ? (
            <>
              <div style={{ height: 12 }} />
              <AuditInfo record={quote} />
            </>
          ) : null}
        </div>
      ),
    },
    ...(!isNew
      ? [
          {
            key: 'attachments',
            label: 'Attachments',
            children: <AttachmentsTab ownerType="quote" ownerId={quote!._id!} canManage={canManage} />,
          },
        ]
      : []),
    ...(!isNew && can(P.PURCHASING_VIEW_AUDIT_LOGS)
      ? [{ key: 'history', label: 'History', children: <HistoryTab entityId={quote!._id!} /> }]
      : []),
  ];

  return (
    <>
      {quote ? (
        <Space style={{ marginBottom: 12 }} size={12}>
          <strong>{quote.vendor?.name}</strong>
          <StatusTag status={status} />
        </Space>
      ) : null}
      {quote && canManage ? (
        <div className="purchasing-actions-bar">
          <Space wrap>
            {status === 'received' ? (
              <>
                <Button onClick={() => runAction(selectQuote({ variables: { _id: quote._id! } }), 'Quote selected')}>
                  Select This Quote
                </Button>
                <Button onClick={() => runAction(rejectQuote({ variables: { _id: quote._id! } }), 'Quote rejected')}>
                  Reject
                </Button>
              </>
            ) : null}
            {status !== 'rejected' ? (
              <Popconfirm
                title="Create a purchase order from this quote?"
                okText="Create"
                cancelText="No"
                onConfirm={async () => {
                  const result = await createOrder({ variables: { quoteId: quote._id! } }).catch((error: Error) => {
                    Modal.error({ title: 'Could not create the order', content: error.message });
                    return null;
                  });
                  const orderId = result?.data?.createPurchasingOrderFromQuote?._id;
                  if (orderId) history.push(paths.orderEditPath(orderId));
                }}
              >
                <Button type="primary">Create Purchase Order</Button>
              </Popconfirm>
            ) : null}
            <Popconfirm
              title="Delete this quote?"
              okText="Yes"
              cancelText="No"
              onConfirm={async () => {
                const ok = await runAction(deleteQuote({ variables: { _id: quote._id! } }), 'Quote deleted');
                if (ok) history.replace(paths.quotesPath);
              }}
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          </Space>
        </div>
      ) : null}
      <Tabs items={items} className={items.length === 1 ? 'purchasing-single-tab' : undefined} />
    </>
  );
};

export default QuotePage;
