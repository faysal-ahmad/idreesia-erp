import React, { useState } from 'react';
import { Button, DatePicker, Form, Input, TextArea } from 'antd-mobile';
import { CameraOutline, CloseOutline } from 'antd-mobile-icons';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';

import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess, showWarning, useNavigateBack } from '../../../layout';
import { useOnlineStatus } from '../../../hooks';
import { useParams } from '../../../router';
import { capturePhoto } from '../../../utilities';
import { dataUrlToFile, uploadPurchasingAttachment } from '../components/upload-attachment';
import { formatDate, formatQuantity, RECEIVABLE_ORDER_STATUSES, toDateInput } from '../format';
import { MOBILE_PURCHASING_ORDER_BY_ID, MOBILE_PURCHASING_POST_RECEIPT } from '../gql';
import { PurchasingPaths } from '../paths';
import { usePurchasingAccess } from '../use-purchasing-access';

interface LineValues {
  orderLineId: string;
  received?: string;
  rejected?: string;
  remarks?: string;
}

interface FormValues {
  deliveryNoteNo?: string;
  notes?: string;
  lines: LineValues[];
}

const MAX_PHOTOS = 6;

const toNumber = (value?: string) => {
  const number = Number(value);
  return value && Number.isFinite(number) ? number : 0;
};

const REFRESH = [
  'mobilePurchasingPagedOrders',
  'mobilePurchasingOrderById',
  'mobilePurchasingPagedReceipts',
  'mobilePurchasingDashboard',
];

/**
 * Purchasing → Receiving → an order. Record what arrived (and what was
 * rejected) line by line, photograph the delivery note and the goods, and
 * post the receipt. Photos are attached to the receipt once it is posted.
 */
export const ReceiveScreen = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const client = useApolloClient();
  const online = useOnlineStatus();
  const { user } = usePurchasingAccess();
  const back = useNavigateBack(PurchasingPaths.receiving);
  const [receivedDate, setReceivedDate] = useState(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useQuery(MOBILE_PURCHASING_ORDER_BY_ID, {
    variables: { _id: orderId },
    fetchPolicy: 'network-only',
  });
  const [postReceipt] = useMutation(MOBILE_PURCHASING_POST_RECEIPT, { refetchQueries: REFRESH });

  const order = data?.purchasingOrderById;
  const page = (body: React.ReactNode) => (
    <Page backTo={PurchasingPaths.receiving} title="Receive goods">
      {body}
    </Page>
  );

  if (loading && !order) return page(<PageLoading />);
  if (error && !order) return page(<PageError error={error} onRetry={() => refetch()} />);
  if (!order) return page(<PageEmpty title="Purchase order not found" />);
  if (!RECEIVABLE_ORDER_STATUSES.includes(order.status ?? '')) {
    return page(<PageEmpty description="Goods can't be received against this order." title="Not open for receiving" />);
  }

  // Only lines with goods still due are listed.
  const dueLines = (order.lines ?? []).filter(
    (line): line is NonNullable<typeof line> & { _id: string } =>
      !!line?._id && (line.quantity ?? 0) - (line.receivedQuantity ?? 0) > 0
  );
  if (dueLines.length === 0) {
    return page(<PageEmpty title="Everything on this order has been received" />);
  }
  const remainingOf = (index: number) => (dueLines[index].quantity ?? 0) - (dueLines[index].receivedQuantity ?? 0);

  const addPhoto = async () => {
    try {
      const photo = await capturePhoto();
      if (photo) setPhotos(current => [...current, photo]);
    } catch (photoError) {
      showError(photoError, 'Could not take the photo.');
    }
  };

  const save = async (values: FormValues) => {
    const lines = (values.lines ?? [])
      .map(line => ({
        orderLineId: line.orderLineId,
        receivedQuantity: toNumber(line.received),
        rejectedQuantity: toNumber(line.rejected) || undefined,
        remarks: line.remarks?.trim() || undefined,
      }))
      .filter(line => line.receivedQuantity > 0 || (line.rejectedQuantity ?? 0) > 0);
    if (lines.length === 0) {
      showWarning('Enter what was received.', 'Fill in at least one quantity.');
      return;
    }
    const tooMuch = (values.lines ?? []).findIndex((line, index) => toNumber(line.received) > remainingOf(index));
    if (tooMuch >= 0) {
      showWarning(
        'Received more than was ordered.',
        `"${dueLines[tooMuch].description}": only ${formatQuantity(remainingOf(tooMuch))} is still due.`
      );
      return;
    }

    setSaving(true);
    let receiptId: string | null | undefined;
    try {
      const result = await postReceipt({
        variables: {
          orderId,
          receivedDate: toDateInput(receivedDate),
          receivedBy: user?.karkun?._id ?? undefined,
          deliveryNoteNo: values.deliveryNoteNo?.trim() || undefined,
          notes: values.notes?.trim() || undefined,
          lines,
        },
      });
      receiptId = result.data?.postPurchasingReceipt?._id;
    } catch (postError) {
      showError(postError, 'Could not save the receipt.');
      setSaving(false);
      return;
    }

    // The receipt exists now; attach the photos to it. A failed photo doesn't undo it.
    let failed = 0;
    if (receiptId) {
      for (let index = 0; index < photos.length; index += 1) {
        try {
          await uploadPurchasingAttachment(client, {
            ownerType: 'receipt',
            ownerId: receiptId,
            file: dataUrlToFile(photos[index], `Delivery photo ${index + 1}.jpg`),
          });
        } catch {
          failed += 1;
        }
      }
    }
    setSaving(false);
    if (failed > 0) {
      showWarning(
        'Receipt saved, but some photos were not attached.',
        'Open the receipt under Receipts to add them again.'
      );
    } else {
      showSuccess('Goods received.');
    }
    back();
  };

  return (
    <Page backTo={PurchasingPaths.receiving} title="Receive goods">
      <Form
        footer={
          <Button block color="primary" disabled={!online} loading={saving} type="submit">
            Post receipt
          </Button>
        }
        initialValues={{
          lines: dueLines.map((line, index) => ({
            orderLineId: line._id,
            received: String(remainingOf(index)),
            rejected: '',
          })),
        }}
        layout="vertical"
        mode="card"
        onFinish={save}
      >
        <Form.Header>
          {order.number} · {order.vendor?.name}
        </Form.Header>
        <Form.Item arrowIcon label="Received on" onClick={() => setDateOpen(true)}>
          <span>{formatDate(String(receivedDate.getTime()))}</span>
        </Form.Item>
        <DatePicker
          max={new Date()}
          title="Received on"
          value={receivedDate}
          visible={dateOpen}
          onClose={() => setDateOpen(false)}
          onConfirm={setReceivedDate}
        />
        <Form.Item label="Delivery note no." name="deliveryNoteNo">
          <Input maxLength={100} placeholder="Optional" />
        </Form.Item>
        <Form.Item label="Notes" name="notes">
          <TextArea autoSize={{ minRows: 2, maxRows: 5 }} maxLength={1000} placeholder="Optional" />
        </Form.Item>

        <Form.Array name="lines" renderHeader={() => null}>
          {fields =>
            fields.map(({ index }) => {
              const line = dueLines[index];
              return (
                <React.Fragment key={line._id}>
                  <Form.Item name={[index, 'orderLineId']} hidden>
                    <Input />
                  </Form.Item>
                  <Form.Header>
                    {line.description}
                    <div className="purchasing-receive-hint">
                      Ordered {formatQuantity(line.quantity)} {line.unit} · received so far{' '}
                      {formatQuantity(line.receivedQuantity ?? 0)}
                    </div>
                  </Form.Header>
                  <Form.Item label={`Received now (${line.unit ?? ''}, up to ${formatQuantity(remainingOf(index))})`} name={[index, 'received']}>
                    <Input inputMode="decimal" type="number" />
                  </Form.Item>
                  <Form.Item label="Rejected" name={[index, 'rejected']}>
                    <Input inputMode="decimal" placeholder="0" type="number" />
                  </Form.Item>
                  <Form.Item label="Remarks" name={[index, 'remarks']}>
                    <Input maxLength={300} placeholder="Optional, e.g. damaged" />
                  </Form.Item>
                </React.Fragment>
              );
            })
          }
        </Form.Array>

        <Form.Header>Photos</Form.Header>
        <Form.Item>
          <div className="purchasing-photos">
            {photos.map((photo, index) => (
              <div key={photo.slice(-40) + index} className="purchasing-photo">
                <img alt={`Delivery ${index + 1}`} src={photo} />
                <CloseOutline
                  aria-label="Remove photo"
                  className="purchasing-photo-remove"
                  onClick={() => setPhotos(current => current.filter((_, at) => at !== index))}
                />
              </div>
            ))}
            {photos.length < MAX_PHOTOS && (
              <button className="purchasing-photo purchasing-photo-add" type="button" onClick={addPhoto}>
                <CameraOutline />
                <span>Take photo</span>
              </button>
            )}
          </div>
        </Form.Item>
      </Form>
    </Page>
  );
};
