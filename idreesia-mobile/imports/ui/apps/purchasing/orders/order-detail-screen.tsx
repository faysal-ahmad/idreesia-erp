import React, { useState } from 'react';
import { Button } from 'antd-mobile';
import { useMutation, useQuery } from '@apollo/client/react';

import { showError, showSuccess } from '../../../layout';
import { useOnlineStatus } from '../../../hooks';
import { openExternalUrl } from '../../../utilities/open-external-url';
import { useHistory, useParams } from '../../../router';
import { AttachmentsSection } from '../components/attachments-section';
import { DetailFields, DetailSummary } from '../components/detail-fields';
import { DocumentPage } from '../components/document-page';
import { LinesCard } from '../components/lines-card';
import { ReasonPopup } from '../components/reason-popup';
import { StatusTag } from '../components/status-tag';
import { formatDate, formatMoney, formatQuantity, RECEIVABLE_ORDER_STATUSES } from '../format';
import {
  MOBILE_PURCHASING_APPROVE_ORDER,
  MOBILE_PURCHASING_ORDER_BY_ID,
  MOBILE_PURCHASING_RETURN_ORDER_TO_DRAFT,
} from '../gql';
import { PurchasingPaths } from '../paths';
import { usePurchasingAccess } from '../use-purchasing-access';

interface Props {
  /** Where the back arrow goes: the screen the order was opened from. */
  backTo?: string;
}

const REFRESH = [
  'mobilePurchasingPagedOrders',
  'mobilePurchasingOrderById',
  'mobilePurchasingDashboard',
];

/**
 * Purchasing → a purchase order. Approvers can approve it or send it back to
 * a draft (with a reason) while it is pending approval; people who receive
 * goods can start a receipt from it.
 */
export const OrderDetailScreen = ({ backTo = PurchasingPaths.orders }: Props) => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const online = useOnlineStatus();
  const { canApproveOrders, canManageOrders, canManageReceipts } = usePurchasingAccess();
  const [returning, setReturning] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, refetch } = useQuery(MOBILE_PURCHASING_ORDER_BY_ID, {
    variables: { _id: id },
    fetchPolicy: 'cache-and-network',
  });
  const [approve] = useMutation(MOBILE_PURCHASING_APPROVE_ORDER, { refetchQueries: REFRESH });
  const [returnToDraft] = useMutation(MOBILE_PURCHASING_RETURN_ORDER_TO_DRAFT, { refetchQueries: REFRESH });

  const order = data?.purchasingOrderById;
  const status = order?.status ?? '';

  let footer;
  if (status === 'pending-approval' && canApproveOrders) {
    footer = (
      <div className="purchasing-footer-buttons">
        <Button block color="danger" disabled={!online} fill="outline" onClick={() => setReturning(true)}>
          Return to draft
        </Button>
        <Button
          block
          color="primary"
          disabled={!online}
          loading={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await approve({ variables: { _id: id } });
              showSuccess('Order approved.');
            } catch (approveError) {
              showError(approveError, 'Could not approve the order.');
            } finally {
              setBusy(false);
            }
          }}
        >
          Approve
        </Button>
      </div>
    );
  } else if (RECEIVABLE_ORDER_STATUSES.includes(status) && canManageReceipts) {
    footer = (
      <Button block color="primary" onClick={() => history.push(PurchasingPaths.receive(id))}>
        Receive goods
      </Button>
    );
  }

  return (
    <DocumentPage
      backTo={backTo}
      error={error}
      footer={footer}
      found={Boolean(order)}
      loading={loading}
      notFoundTitle="Purchase order not found"
      refetch={() => refetch()}
      title="Purchase order"
    >
      {order && (
        <>
          <DetailSummary
            amount={formatMoney(order.total)}
            eyebrow={order.number}
            tag={<StatusTag status={order.status} />}
            title={order.vendor?.name}
          />
          <DetailFields
            fields={[
              {
                label: 'Vendor phone',
                value: order.vendor?.phone ? (
                  <a
                    href={`tel:${order.vendor.phone}`}
                    onClick={event => {
                      event.preventDefault();
                      openExternalUrl(`tel:${order.vendor?.phone}`);
                    }}
                  >
                    {order.vendor.phone}
                  </a>
                ) : null,
              },
              { label: 'Order date', value: formatDate(order.orderDate) },
              { label: 'Expected delivery', value: formatDate(order.expectedDeliveryDate) },
              { label: 'Delivery address', value: order.deliveryAddress },
              {
                label: 'Payment terms',
                value: order.paymentTermsDays != null ? `${order.paymentTermsDays} days` : null,
              },
              { label: 'Notes', value: order.notes },
              { label: 'Sent back because', value: status === 'draft' ? order.rejectionReason : null },
            ]}
          />
          <LinesCard
            rows={(order.lines ?? []).map((line, index) => ({
              key: line?._id ?? String(index),
              title: line?.description,
              detail: [
                `${formatQuantity(line?.quantity)} ${line?.unit ?? ''} × ${formatMoney(line?.unitPrice)}`.trim(),
                line?.receivedQuantity ? `received ${formatQuantity(line.receivedQuantity)}` : null,
              ]
                .filter(Boolean)
                .join(' · '),
              amount: formatMoney((line?.quantity ?? 0) * (line?.unitPrice ?? 0)),
            }))}
            title="Items"
          />
          <DetailFields
            fields={[
              { label: 'Subtotal', value: formatMoney(order.subtotal) },
              { label: 'Tax', value: order.taxTotal ? formatMoney(order.taxTotal) : null },
              { label: 'Discount', value: order.discount ? formatMoney(order.discount) : null },
              { label: 'Shipping', value: order.shipping ? formatMoney(order.shipping) : null },
              { label: 'Total', value: formatMoney(order.total), strong: true },
            ]}
          />
          <AttachmentsSection canChange={canManageOrders} ownerId={id} ownerType="order" />

          <ReasonPopup
            confirmText="Return to draft"
            placeholder="What needs to change?"
            title="Return to draft"
            visible={returning}
            onClose={() => setReturning(false)}
            onConfirm={async reason => {
              try {
                await returnToDraft({ variables: { _id: id, reason } });
                showSuccess('Order returned to draft.');
                setReturning(false);
              } catch (returnError) {
                showError(returnError, 'Could not return the order.');
              }
            }}
          />
        </>
      )}
    </DocumentPage>
  );
};
