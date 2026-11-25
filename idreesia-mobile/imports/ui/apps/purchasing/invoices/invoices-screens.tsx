import React, { useState } from 'react';
import { List, Tag } from 'antd-mobile';
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
import { useQueryParams } from '../components/use-query-params';
import { formatDate, formatMoney, formatQuantity, INVOICE_STATUSES } from '../format';
import { MOBILE_PURCHASING_INVOICE_BY_ID, MOBILE_PURCHASING_PAGED_INVOICES } from '../gql';
import { PurchasingPaths } from '../paths';
import { usePurchasingAccess } from '../use-purchasing-access';

/** Purchasing → Invoices. `?overdue=1` opens it showing only overdue invoices (Home tab link). */
export const InvoicesListScreen = () => {
  const history = useHistory();
  const params = useQueryParams();
  const [overdue, setOverdue] = useState(params.get('overdue') === '1');
  const controls = useListControls({
    statuses: INVOICE_STATUSES,
    placeholder: 'Invoice number',
    extraChips: overdue ? [{ label: 'Overdue', onClear: () => setOverdue(false) }] : [],
  });

  const paged = usePagedQuery(MOBILE_PURCHASING_PAGED_INVOICES, {
    filter: { search: controls.search, status: controls.status, overdue: overdue || undefined },
    toVariables: (filter, paging) => ({
      ...filter,
      pageIndex: Number(paging.pageIndex),
      pageSize: Number(paging.pageSize),
    }),
    getPage: data => data.pagedPurchasingInvoices,
    getKey: invoice => invoice._id,
  });

  return (
    <Page
      backTo={ModulePaths.purchasing}
      right={<div className="page-nav-actions">{controls.filterAction}</div>}
      title="Invoices"
    >
      {controls.toolbar}
      <PagedList
        emptyTitle="No invoices found"
        getKey={invoice => invoice._id ?? ''}
        itemsLabel="invoices"
        paged={paged}
        renderItem={invoice => (
          <List.Item
            arrowIcon
            description={[
              invoice.vendorInvoiceNo ?? invoice.number,
              invoice.dueDate ? `Due ${formatDate(invoice.dueDate)}` : null,
              `Balance ${formatMoney(invoice.balance)}`,
            ]
              .filter(Boolean)
              .join(' · ')}
            extra={
              <div className="purchasing-row-tags">
                {invoice.isDisputed && (
                  <Tag color="danger" fill="outline">
                    Disputed
                  </Tag>
                )}
                <StatusTag status={invoice.status} />
              </div>
            }
            onClick={() => invoice._id && history.push(PurchasingPaths.invoice(invoice._id))}
          >
            {invoice.vendor?.name ?? invoice.number}
          </List.Item>
        )}
      />
    </Page>
  );
};

export const InvoiceDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const { canManageInvoices } = usePurchasingAccess();
  const { data, loading, error, refetch } = useQuery(MOBILE_PURCHASING_INVOICE_BY_ID, {
    variables: { _id: id },
    fetchPolicy: 'cache-and-network',
  });
  const invoice = data?.purchasingInvoiceById;

  return (
    <DocumentPage
      backTo={PurchasingPaths.invoices}
      error={error}
      found={Boolean(invoice)}
      loading={loading}
      notFoundTitle="Invoice not found"
      refetch={() => refetch()}
      title="Invoice"
    >
      {invoice && (
        <>
          <DetailSummary
            amount={`Balance ${formatMoney(invoice.balance)}`}
            eyebrow={invoice.number}
            tag={<StatusTag status={invoice.status} />}
            title={invoice.vendor?.name}
          />
          <DetailFields
            fields={[
              { label: 'Vendor invoice no.', value: invoice.vendorInvoiceNo },
              { label: 'Orders', value: invoice.orders?.map((order) => order?.number).filter(Boolean).join(', ') },
              { label: 'Invoice date', value: formatDate(invoice.invoiceDate) },
              { label: 'Due date', value: formatDate(invoice.dueDate) },
              { label: 'Disputed', value: invoice.isDisputed ? 'Yes' : null },
              { label: 'Notes', value: invoice.notes },
            ]}
          />
          <LinesCard
            rows={(invoice.lines ?? []).map((line, index) => ({
              key: line?._id ?? String(index),
              title: line?.description,
              detail: `${formatQuantity(line?.quantity)} ${line?.unit ?? ''} × ${formatMoney(line?.unitPrice)}`.trim(),
              amount: formatMoney((line?.quantity ?? 0) * (line?.unitPrice ?? 0)),
            }))}
            title="Items"
          />
          <DetailFields
            fields={[
              { label: 'Subtotal', value: formatMoney(invoice.subtotal) },
              { label: 'Tax', value: invoice.taxTotal ? formatMoney(invoice.taxTotal) : null },
              { label: 'Total', value: formatMoney(invoice.total), strong: true },
              { label: 'Paid', value: formatMoney(invoice.paidAmount ?? 0) },
              { label: 'Balance', value: formatMoney(invoice.balance), strong: true },
            ]}
          />
          <AttachmentsSection canChange={canManageInvoices} ownerId={id} ownerType="invoice" />
        </>
      )}
    </DocumentPage>
  );
};
