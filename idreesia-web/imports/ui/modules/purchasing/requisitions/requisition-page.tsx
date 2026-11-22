import React, { useState } from 'react';
import { Link, type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Collapse, Empty, Form, Modal, Popconfirm, Space, Spin, Tabs } from 'antd';

import { Permissions } from 'meteor/idreesia-common/constants';
import { useDynamicBreadcrumbs, useLoggedInUser } from 'meteor/idreesia-common/hooks/common';
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  InputTextField,
  KarkunSelectionInputField,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import AttachmentsTab from '../common/attachments-tab';
import HistoryTab from '../common/history-tab';
import LineItemsEditor, {
  computeLineTotals,
  toLineFormValues,
  toRequisitionLineInput,
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
import { PAGED_PURCHASING_ORDERS, CREATE_PURCHASING_ORDER_FROM_REQUISITION } from '../orders/gql';
import { PAGED_PURCHASING_QUOTES } from '../quotes/gql';
import { default as paths } from '../submodule-paths';
import {
  APPROVE_PURCHASING_REQUISITION,
  CANCEL_PURCHASING_REQUISITION,
  CREATE_PURCHASING_REQUISITION,
  DELETE_PURCHASING_REQUISITION,
  PURCHASING_REQUISITION_BY_ID,
  REOPEN_PURCHASING_REQUISITION,
  REJECT_PURCHASING_REQUISITION,
  SUBMIT_PURCHASING_REQUISITION,
  UPDATE_PURCHASING_REQUISITION,
} from './gql';

const P = Permissions;
const REFETCH = ['purchasingRequisitionById', 'pagedPurchasingRequisitions', 'purchasingDashboard'];

interface FormValues {
  title: string;
  purpose?: string;
  requestedBy?: { _id?: string } | null;
  neededBy?: import('dayjs').Dayjs | null;
  lines: LineFormValue[];
}

const RequisitionPage = ({ match, history }: RouteComponentProps<{ requisitionId?: string }>) => {
  const id = match.params.requisitionId;
  const isNew = !id;
  const { can } = usePurchasingAccess();
  const { user } = useLoggedInUser();
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [orderVendorId, setOrderVendorId] = useState<string | undefined>();

  const { data, loading } = useQuery(PURCHASING_REQUISITION_BY_ID, {
    variables: { _id: id ?? '' },
    skip: isNew,
  });
  const requisition = data?.purchasingRequisitionById;
  const orders = useQuery(PAGED_PURCHASING_ORDERS, {
    variables: { requisitionId: id, pageIndex: 0, pageSize: 20 },
    skip: isNew,
  });
  const quotes = useQuery(PAGED_PURCHASING_QUOTES, {
    variables: { requisitionId: id, pageIndex: 0, pageSize: 20 },
    skip: isNew,
  });

  const [createRequisition, { loading: creating }] = useMutation(CREATE_PURCHASING_REQUISITION, { refetchQueries: REFETCH });
  const [updateRequisition, { loading: updating }] = useMutation(UPDATE_PURCHASING_REQUISITION, { refetchQueries: REFETCH });
  const [submitRequisition] = useMutation(SUBMIT_PURCHASING_REQUISITION, { refetchQueries: REFETCH });
  const [approveRequisition] = useMutation(APPROVE_PURCHASING_REQUISITION, { refetchQueries: REFETCH });
  const [rejectRequisition] = useMutation(REJECT_PURCHASING_REQUISITION, { refetchQueries: REFETCH });
  const [reopenRequisition] = useMutation(REOPEN_PURCHASING_REQUISITION, { refetchQueries: REFETCH });
  const [cancelRequisition] = useMutation(CANCEL_PURCHASING_REQUISITION, { refetchQueries: REFETCH });
  const [deleteRequisition] = useMutation(DELETE_PURCHASING_REQUISITION, { refetchQueries: REFETCH });
  const [createOrder, { loading: creatingOrder }] = useMutation(CREATE_PURCHASING_ORDER_FROM_REQUISITION, {
    refetchQueries: [...REFETCH, 'pagedPurchasingOrders'],
  });

  useDynamicBreadcrumbs(['Purchasing', 'Requisitions', isNew ? 'New' : requisition?.number || '']);

  if (!isNew && loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!isNew && !requisition?._id) {
    return <Empty description="Requisition not found" style={{ padding: '80px 0' }} />;
  }

  const status = requisition?.status;
  const editable = isNew || status === 'draft';
  const canManage = can(P.PURCHASING_MANAGE_REQUISITIONS);
  const canApprove = can(P.PURCHASING_APPROVE_REQUISITIONS);

  const handleFinish = async (values: FormValues) => {
    const common = {
      title: values.title,
      purpose: values.purpose,
      requestedBy: values.requestedBy?._id,
      neededBy: toDateInput(values.neededBy),
      lines: toRequisitionLineInput(values.lines),
    };
    if (isNew) {
      const result = await createRequisition({ variables: common }).catch((error: Error) => {
        Modal.error({ title: 'Could not save', content: error.message });
        return null;
      });
      const newId = result?.data?.createPurchasingRequisition?._id;
      if (newId) history.replace(paths.requisitionEditPath(newId));
      return;
    }
    const ok = await runAction(
      updateRequisition({
        variables: { _id: requisition!._id!, version: requisition!.version!, ...common },
      }),
      'Requisition saved'
    );
    if (ok) setIsFieldsTouched(false);
  };

  const person = requisition?.requestedByPerson ?? (isNew ? user?.karkun : null);
  const initialLines = isNew ? [{ quantity: 1 }] : toLineFormValues(requisition?.lines);
  const totals = (lines: LineFormValue[] | undefined) => computeLineTotals(lines, 'requisition');

  const detailsForm = (
    <Form
      key={`${id ?? 'new'}-${requisition?.version ?? 0}`}
      layout="horizontal"
      initialValues={{ lines: initialLines }}
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
                <InputTextField
                  fieldName="title"
                  fieldLabel="Title"
                  initialValue={requisition?.title}
                  required
                  requiredMessage="Please input a title."
                  disabled={!editable}
                />
                <InputTextAreaField
                  fieldName="purpose"
                  fieldLabel="Purpose"
                  initialValue={requisition?.purpose}
                />
                <KarkunSelectionInputField
                  fieldName="requestedBy"
                  fieldLabel="Requested By"
                  initialValue={
                    person?._id ? { _id: person._id, name: person.sharedData?.name } : null
                  }
                  disabled={!editable}
                />
                <DateField
                  fieldName="neededBy"
                  fieldLabel="Needed By"
                  initialValue={toDayjs(requisition?.neededBy)}
                  disabled={!editable}
                  allowClear
                />
              </>
            ),
          },
          {
            key: 'items',
            label: 'Items',
            forceRender: true,
            children: editable ? (
              <>
                <LineItemsEditor variant="requisition" />
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldValue }) => (
                    <TotalsSummary
                      subtotal={totals(getFieldValue('lines')).subtotal}
                      total={totals(getFieldValue('lines')).total}
                    />
                  )}
                </Form.Item>
              </>
            ) : (
              <>
                <LinesTable lines={requisition?.lines} price="estimatedUnitPrice" />
                <div style={{ height: 8 }} />
                <TotalsSummary
                  subtotal={requisition?.estimatedTotal ?? 0}
                  total={requisition?.estimatedTotal ?? 0}
                />
              </>
            ),
          },
        ]}
      />
      {editable && canManage ? (
        <FormButtonsSaveCancel
          fullWidth
          handleCancel={() => history.push(paths.requisitionsPath)}
          isFieldsTouched={isFieldsTouched || isNew}
        />
      ) : null}
      {creating || updating ? <Spin /> : null}
    </Form>
  );

  const relatedOrders = (orders.data?.pagedPurchasingOrders?.data ?? []).filter((o) => o?._id);
  const relatedQuotes = (quotes.data?.pagedPurchasingQuotes?.data ?? []).filter((q) => q?._id);

  const actions = !requisition ? null : (
    <div className="purchasing-actions-bar">
      <Space wrap>
        {status === 'draft' && canManage ? (
          <Button type="primary" onClick={() => runAction(submitRequisition({ variables: { _id: requisition._id! } }), 'Requisition submitted')}>
            Submit for Approval
          </Button>
        ) : null}
        {status === 'submitted' && canApprove ? (
          <>
            <Button type="primary" onClick={() => runAction(approveRequisition({ variables: { _id: requisition._id! } }), 'Requisition approved')}>
              Approve
            </Button>
            <Button danger onClick={() => setRejecting(true)}>Reject</Button>
          </>
        ) : null}
        {status === 'rejected' && canManage ? (
          <Button onClick={() => runAction(reopenRequisition({ variables: { _id: requisition._id! } }), 'Requisition reopened as a draft')}>
            Reopen as Draft
          </Button>
        ) : null}
        {(status === 'approved' || status === 'ordered') && can(P.PURCHASING_MANAGE_ORDERS) ? (
          <>
            <Button onClick={() => history.push(`${paths.quoteNewPath}?requisitionId=${requisition._id}`)}>
              Add Quote
            </Button>
            <Button type="primary" onClick={() => setOrdering(true)}>Create Purchase Order</Button>
          </>
        ) : null}
        {['draft', 'submitted', 'approved'].includes(status ?? '') && canManage ? (
          <Popconfirm
            title="Cancel this requisition?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => runAction(cancelRequisition({ variables: { _id: requisition._id! } }), 'Requisition cancelled')}
          >
            <Button danger>Cancel Requisition</Button>
          </Popconfirm>
        ) : null}
        {status === 'draft' && canManage ? (
          <Popconfirm
            title="Delete this draft?"
            okText="Yes"
            cancelText="No"
            onConfirm={async () => {
              const ok = await runAction(deleteRequisition({ variables: { _id: requisition._id! } }), 'Requisition deleted');
              if (ok) history.replace(paths.requisitionsPath);
            }}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        ) : null}
      </Space>
    </div>
  );

  const items = [
    {
      key: 'details',
      label: 'Details',
      children: (
        <div className="purchasing-document">
          {requisition?.rejectionReason && status === 'rejected' ? (
            <p style={{ color: '#b42318' }}>Rejected: {requisition.rejectionReason}</p>
          ) : null}
          {detailsForm}
          {!isNew && (relatedQuotes.length > 0 || relatedOrders.length > 0) ? (
            <Collapse
              className="visitor-form-sections"
              style={{ marginTop: 12 }}
              defaultActiveKey={['related']}
              items={[
                {
                  key: 'related',
                  label: 'Related Documents',
                  children: (
                    <Space direction="vertical">
                      {relatedQuotes.map((quote) => (
                        <Link key={quote!._id!} to={paths.quoteEditPath(quote!._id!)}>
                          Quote from {quote!.vendor?.name} ({formatMoney(quote!.total)})
                        </Link>
                      ))}
                      {relatedOrders.map((order) => (
                        <Link key={order!._id!} to={paths.orderEditPath(order!._id!)}>
                          Order {order!.number} - {order!.vendor?.name} ({formatMoney(order!.total)})
                        </Link>
                      ))}
                    </Space>
                  ),
                },
              ]}
            />
          ) : null}
          {requisition ? (
            <>
              <div style={{ height: 12 }} />
              <AuditInfo record={requisition} />
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
            children: <AttachmentsTab ownerType="requisition" ownerId={requisition!._id!} canManage={canManage} />,
          },
        ]
      : []),
    ...(!isNew && can(P.PURCHASING_VIEW_AUDIT_LOGS)
      ? [{ key: 'history', label: 'History', children: <HistoryTab entityId={requisition!._id!} /> }]
      : []),
  ];

  return (
    <>
      {requisition ? (
        <Space style={{ marginBottom: 12 }} size={12}>
          <strong>{requisition.number}</strong>
          <StatusTag status={status} />
          <span style={{ color: '#667085' }}>Needed by {formatDate(requisition.neededBy) || '-'}</span>
        </Space>
      ) : null}
      {actions}
      <Tabs items={items} />

      <ReasonModal
        open={rejecting}
        title="Reject Requisition"
        okText="Reject"
        onCancel={() => setRejecting(false)}
        onOk={async (reason) => {
          const ok = await runAction(
            rejectRequisition({ variables: { _id: requisition!._id!, reason } }),
            'Requisition rejected'
          );
          if (ok) setRejecting(false);
        }}
      />
      <Modal
        title="Create Purchase Order"
        open={ordering}
        okText="Create"
        okButtonProps={{ disabled: !orderVendorId }}
        confirmLoading={creatingOrder}
        onCancel={() => setOrdering(false)}
        onOk={async () => {
          const result = await createOrder({
            variables: { requisitionId: requisition!._id!, vendorId: orderVendorId! },
          }).catch((error: Error) => {
            Modal.error({ title: 'Could not create the order', content: error.message });
            return null;
          });
          const orderId = result?.data?.createPurchasingOrderFromRequisition?._id;
          if (orderId) {
            setOrdering(false);
            history.push(paths.orderEditPath(orderId));
          }
        }}
        destroyOnHidden
      >
        <p>Choose the vendor. The order starts as a draft with this requisition&apos;s items.</p>
        <VendorSelect value={orderVendorId} onChange={setOrderVendorId} style={{ width: '100%' }} />
      </Modal>
    </>
  );
};

export default RequisitionPage;
