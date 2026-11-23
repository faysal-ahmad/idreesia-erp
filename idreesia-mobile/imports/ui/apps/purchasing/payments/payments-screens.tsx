import React from 'react';
import { List } from 'antd-mobile';
import { useQuery } from '@apollo/client/react';
import { ModulePaths } from 'meteor/idreesia-common/constants';

import { PagedList } from '../../../components';
import { usePagedQuery } from '../../../hooks';
import { Page } from '../../../layout';
import { useHistory, useParams } from '../../../router';
import { AttachmentsSection } from '../components/attachments-section';
import { DetailFields, DetailSummary } from '../components/detail-fields';
import { DocumentPage } from '../components/document-page';
import { LinesCard } from '../components/lines-card';
import { useListControls } from '../components/list-controls';
import { StatusTag } from '../components/status-tag';
import { formatDate, formatMoney, PAYMENT_STATUSES, statusLabel } from '../format';
import { MOBILE_PURCHASING_PAGED_PAYMENTS, MOBILE_PURCHASING_PAYMENT_BY_ID } from '../gql';
import { PurchasingPaths } from '../paths';
import { usePurchasingAccess } from '../use-purchasing-access';

/** Purchasing → Payments. */
export const PaymentsListScreen = () => {
  const history = useHistory();
  const controls = useListControls({ statuses: PAYMENT_STATUSES, placeholder: 'Payment number' });

  const paged = usePagedQuery(MOBILE_PURCHASING_PAGED_PAYMENTS, {
    filter: { search: controls.search, status: controls.status },
    toVariables: (filter, paging) => ({
      ...filter,
      pageIndex: Number(paging.pageIndex),
      pageSize: Number(paging.pageSize),
    }),
    getPage: data => data.pagedPurchasingPayments,
    getKey: payment => payment._id,
  });

  return (
    <Page
      backTo={ModulePaths.purchasing}
      right={<div className="page-nav-actions">{controls.filterAction}</div>}
      title="Payments"
    >
      {controls.toolbar}
      <PagedList
        emptyTitle="No payments found"
        getKey={payment => payment._id ?? ''}
        itemsLabel="payments"
        paged={paged}
        renderItem={payment => (
          <List.Item
            arrowIcon
            description={[
              payment.number,
              formatDate(payment.paymentDate),
              payment.method ? statusLabel(payment.method) : null,
              formatMoney(payment.amount),
            ]
              .filter(Boolean)
              .join(' · ')}
            extra={<StatusTag status={payment.status} />}
            onClick={() => payment._id && history.push(PurchasingPaths.payment(payment._id))}
          >
            {payment.vendor?.name ?? payment.number}
          </List.Item>
        )}
      />
    </Page>
  );
};

export const PaymentDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { canManagePayments } = usePurchasingAccess();
  const { data, loading, error, refetch } = useQuery(MOBILE_PURCHASING_PAYMENT_BY_ID, {
    variables: { _id: id },
    fetchPolicy: 'cache-and-network',
  });
  const payment = data?.purchasingPaymentById;

  return (
    <DocumentPage
      backTo={PurchasingPaths.payments}
      error={error}
      found={Boolean(payment)}
      loading={loading}
      notFoundTitle="Payment not found"
      refetch={() => refetch()}
      title="Payment"
    >
      {payment && (
        <>
          <DetailSummary
            amount={formatMoney(payment.amount)}
            eyebrow={payment.number}
            tag={<StatusTag status={payment.status} />}
            title={payment.vendor?.name}
          />
          <DetailFields
            fields={[
              { label: 'Paid on', value: formatDate(payment.paymentDate) },
              { label: 'Method', value: payment.method ? statusLabel(payment.method) : null },
              { label: 'Reference', value: payment.reference },
              { label: 'Notes', value: payment.notes },
              { label: 'Voided because', value: payment.status === 'voided' ? payment.voidReason : null },
            ]}
          />
          <LinesCard
            rows={(payment.allocations ?? []).map((allocation, index) => ({
              key: allocation?.invoiceId ?? String(index),
              title: (
                <a
                  href="#"
                  onClick={event => {
                    event.preventDefault();
                    if (allocation?.invoiceId) history.push(PurchasingPaths.invoice(allocation.invoiceId));
                  }}
                >
                  {allocation?.invoice?.vendorInvoiceNo ?? allocation?.invoice?.number}
                </a>
              ),
              amount: formatMoney(allocation?.amount),
            }))}
            title="Paid invoices"
          />
          <AttachmentsSection canChange={canManagePayments} ownerId={id} ownerType="payment" />
        </>
      )}
    </DocumentPage>
  );
};
