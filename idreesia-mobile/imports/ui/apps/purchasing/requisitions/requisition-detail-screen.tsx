import React, { useState } from 'react';
import { ActionSheet, Button, Dialog } from 'antd-mobile';
import { MoreOutline } from 'antd-mobile-icons';
import { useMutation, useQuery } from '@apollo/client/react';

import { showError, showSuccess } from '../../../layout';
import { useOnlineStatus } from '../../../hooks';
import { useHistory, useParams } from '../../../router';
import { AttachmentsSection } from '../components/attachments-section';
import { DetailFields, DetailSummary } from '../components/detail-fields';
import { DocumentPage } from '../components/document-page';
import { LinesCard } from '../components/lines-card';
import { ReasonPopup } from '../components/reason-popup';
import { formatDate, formatMoney, formatQuantity } from '../format';
import {
  MOBILE_PURCHASING_APPROVE_REQUISITION,
  MOBILE_PURCHASING_CANCEL_REQUISITION,
  MOBILE_PURCHASING_REJECT_REQUISITION,
  MOBILE_PURCHASING_REOPEN_REQUISITION,
  MOBILE_PURCHASING_REQUISITION_BY_ID,
  MOBILE_PURCHASING_SUBMIT_REQUISITION,
} from '../gql';
import { PurchasingPaths } from '../paths';
import { usePurchasingAccess } from '../use-purchasing-access';
import { StatusTag } from '../components/status-tag';

interface Props {
  /** Where the back arrow goes: the screen the requisition was opened from. */
  backTo?: string;
}

const REFRESH = ['mobilePurchasingPagedRequisitions', 'mobilePurchasingRequisitionById'];

/**
 * Purchasing → a requisition. Approvers can approve or reject it while it is
 * submitted; people who manage requisitions can submit, edit, reopen or cancel.
 */
export const RequisitionDetailScreen = ({ backTo = PurchasingPaths.requisitions }: Props) => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const online = useOnlineStatus();
  const { canManageRequisitions, canApproveRequisitions } = usePurchasingAccess();
  const [rejecting, setRejecting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data, loading, error, refetch } = useQuery(MOBILE_PURCHASING_REQUISITION_BY_ID, {
    variables: { _id: id },
    fetchPolicy: 'cache-and-network',
  });
  const options = { refetchQueries: REFRESH };
  const [approve] = useMutation(MOBILE_PURCHASING_APPROVE_REQUISITION, options);
  const [reject] = useMutation(MOBILE_PURCHASING_REJECT_REQUISITION, options);
  const [submit] = useMutation(MOBILE_PURCHASING_SUBMIT_REQUISITION, options);
  const [reopen] = useMutation(MOBILE_PURCHASING_REOPEN_REQUISITION, options);
  const [cancel] = useMutation(MOBILE_PURCHASING_CANCEL_REQUISITION, options);

  const requisition = data?.purchasingRequisitionById;
  const status = requisition?.status ?? '';

  const run = async (action: () => Promise<unknown>, done: string, failed: string) => {
    setBusy(true);
    try {
      await action();
      showSuccess(done);
    } catch (actionError) {
      showError(actionError, failed);
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = async () => {
    const confirmed = await Dialog.confirm({
      content: 'Cancel this requisition? It cannot be used for an order afterwards.',
      confirmText: <span className="purchasing-danger-text">Cancel requisition</span>,
      cancelText: 'Keep it',
    });
    if (confirmed) {
      await run(() => cancel({ variables: { _id: id } }), 'Requisition cancelled.', 'Could not cancel the requisition.');
    }
  };

  let footer;
  if (status === 'submitted' && canApproveRequisitions) {
    footer = (
      <div className="purchasing-footer-buttons">
        <Button block disabled={!online} color="danger" fill="outline" onClick={() => setRejecting(true)}>
          Reject
        </Button>
        <Button
          block
          color="primary"
          disabled={!online}
          loading={busy}
          onClick={() =>
            run(() => approve({ variables: { _id: id } }), 'Requisition approved.', 'Could not approve the requisition.')
          }
        >
          Approve
        </Button>
      </div>
    );
  } else if (status === 'draft' && canManageRequisitions) {
    footer = (
      <div className="purchasing-footer-buttons">
        <Button block fill="outline" onClick={() => history.push(PurchasingPaths.requisitionEdit(id))}>
          Edit
        </Button>
        <Button
          block
          color="primary"
          disabled={!online}
          loading={busy}
          onClick={() =>
            run(() => submit({ variables: { _id: id } }), 'Submitted for approval.', 'Could not submit the requisition.')
          }
        >
          Submit for approval
        </Button>
      </div>
    );
  } else if (status === 'rejected' && canManageRequisitions) {
    footer = (
      <Button
        block
        color="primary"
        disabled={!online}
        loading={busy}
        onClick={() =>
          run(() => reopen({ variables: { _id: id } }), 'Requisition reopened as a draft.', 'Could not reopen the requisition.')
        }
      >
        Reopen as draft
      </Button>
    );
  }

  const canCancel = canManageRequisitions && ['draft', 'submitted', 'approved'].includes(status);

  return (
    <DocumentPage
      backTo={backTo}
      error={error}
      footer={footer}
      found={Boolean(requisition)}
      loading={loading}
      notFoundTitle="Requisition not found"
      refetch={() => refetch()}
      right={
        canCancel ? (
          <div className="page-nav-actions">
            <MoreOutline aria-label="More" className="page-nav-action" onClick={() => setMenuOpen(true)} />
          </div>
        ) : undefined
      }
      title="Requisition"
    >
      {requisition && (
        <>
          <DetailSummary
            amount={requisition.estimatedTotal ? `Estimated ${formatMoney(requisition.estimatedTotal)}` : undefined}
            eyebrow={requisition.number}
            tag={<StatusTag status={requisition.status} />}
            title={requisition.title}
          />
          <DetailFields
            fields={[
              { label: 'Requested by', value: requisition.requestedByPerson?.sharedData?.name },
              { label: 'Needed by', value: formatDate(requisition.neededBy) },
              { label: 'Purpose', value: requisition.purpose },
              { label: 'Rejected because', value: status === 'rejected' ? requisition.rejectionReason : null },
            ]}
          />
          <LinesCard
            rows={(requisition.lines ?? []).map((line, index) => ({
              key: line?._id ?? String(index),
              title: line?.description,
              detail: [
                `${formatQuantity(line?.quantity)} ${line?.unit ?? ''}`.trim(),
                line?.estimatedUnitPrice ? `× ${formatMoney(line.estimatedUnitPrice)}` : null,
              ]
                .filter(Boolean)
                .join(' '),
              amount: line?.estimatedUnitPrice
                ? formatMoney((line.quantity ?? 0) * line.estimatedUnitPrice)
                : undefined,
            }))}
            title="Items"
          />
          <AttachmentsSection canChange={canManageRequisitions} ownerId={id} ownerType="requisition" />

          <ReasonPopup
            confirmText="Reject requisition"
            placeholder="Why is it being rejected?"
            title="Reject requisition"
            visible={rejecting}
            onClose={() => setRejecting(false)}
            onConfirm={async reason => {
              await run(
                () => reject({ variables: { _id: id, reason } }),
                'Requisition rejected.',
                'Could not reject the requisition.'
              );
              setRejecting(false);
            }}
          />
          <ActionSheet
            actions={[{ key: 'cancel', text: 'Cancel requisition', danger: true, disabled: !online }]}
            cancelText="Close"
            visible={menuOpen}
            onAction={() => {
              setMenuOpen(false);
              confirmCancel();
            }}
            onClose={() => setMenuOpen(false)}
          />
        </>
      )}
    </DocumentPage>
  );
};
