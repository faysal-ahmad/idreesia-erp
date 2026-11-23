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
import { formatDate, formatQuantity, RECEIPT_STATUSES } from '../format';
import { MOBILE_PURCHASING_PAGED_RECEIPTS, MOBILE_PURCHASING_RECEIPT_BY_ID } from '../gql';
import { PurchasingPaths } from '../paths';
import { usePurchasingAccess } from '../use-purchasing-access';

/** Purchasing → Goods receipts. */
export const ReceiptsListScreen = () => {
  const history = useHistory();
  const controls = useListControls({ statuses: RECEIPT_STATUSES, placeholder: 'Receipt number' });

  const paged = usePagedQuery(MOBILE_PURCHASING_PAGED_RECEIPTS, {
    filter: { search: controls.search, status: controls.status },
    toVariables: (filter, paging) => ({
      ...filter,
      pageIndex: Number(paging.pageIndex),
      pageSize: Number(paging.pageSize),
    }),
    getPage: data => data.pagedPurchasingReceipts,
    getKey: receipt => receipt._id,
  });

  return (
    <Page
      backTo={ModulePaths.purchasing}
      right={<div className="page-nav-actions">{controls.filterAction}</div>}
      title="Goods receipts"
    >
      {controls.toolbar}
      <PagedList
        emptyTitle="No receipts found"
        getKey={receipt => receipt._id ?? ''}
        itemsLabel="receipts"
        paged={paged}
        renderItem={receipt => (
          <List.Item
            arrowIcon
            description={[receipt.number, receipt.order?.number, formatDate(receipt.receivedDate)]
              .filter(Boolean)
              .join(' · ')}
            extra={<StatusTag status={receipt.status} />}
            onClick={() => receipt._id && history.push(PurchasingPaths.receipt(receipt._id))}
          >
            {receipt.vendor?.name ?? receipt.number}
          </List.Item>
        )}
      />
    </Page>
  );
};

export const ReceiptDetailScreen = () => {
  const { id } = useParams<{ id: string }>();
  const { canManageReceipts } = usePurchasingAccess();
  const { data, loading, error, refetch } = useQuery(MOBILE_PURCHASING_RECEIPT_BY_ID, {
    variables: { _id: id },
    fetchPolicy: 'cache-and-network',
  });
  const receipt = data?.purchasingReceiptById;

  return (
    <DocumentPage
      backTo={PurchasingPaths.receipts}
      error={error}
      found={Boolean(receipt)}
      loading={loading}
      notFoundTitle="Receipt not found"
      refetch={() => refetch()}
      title="Goods receipt"
    >
      {receipt && (
        <>
          <DetailSummary
            eyebrow={receipt.number}
            tag={<StatusTag status={receipt.status} />}
            title={receipt.vendor?.name}
          />
          <DetailFields
            fields={[
              { label: 'Order', value: receipt.order?.number },
              { label: 'Received on', value: formatDate(receipt.receivedDate) },
              { label: 'Received by', value: receipt.receivedByPerson?.sharedData?.name },
              { label: 'Delivery note', value: receipt.deliveryNoteNo },
              { label: 'Notes', value: receipt.notes },
              { label: 'Voided because', value: receipt.status === 'voided' ? receipt.voidReason : null },
            ]}
          />
          <LinesCard
            rows={(receipt.lines ?? []).map((line, index) => ({
              key: line?._id ?? String(index),
              title: line?.description,
              detail: [
                `Received ${formatQuantity(line?.receivedQuantity)} ${line?.unit ?? ''}`.trim(),
                line?.rejectedQuantity ? `rejected ${formatQuantity(line.rejectedQuantity)}` : null,
                line?.remarks,
              ]
                .filter(Boolean)
                .join(' · '),
            }))}
            title="Goods received"
          />
          <AttachmentsSection canChange={canManageReceipts} ownerId={id} ownerType="receipt" />
        </>
      )}
    </DocumentPage>
  );
};
