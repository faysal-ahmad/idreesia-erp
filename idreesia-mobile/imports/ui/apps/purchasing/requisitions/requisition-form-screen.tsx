import React, { useEffect, useState } from 'react';
import { Button, DatePicker, Form, Input, TextArea } from 'antd-mobile';
import { AddCircleOutline } from 'antd-mobile-icons';
import { useMutation, useQuery } from '@apollo/client/react';

import { Page, PageError, PageLoading, showError, showSuccess, showWarning, useNavigateBack } from '../../../layout';
import { useOnlineStatus } from '../../../hooks';
import { useParams } from '../../../router';
import { formatDate, toDateInput } from '../format';
import {
  MOBILE_PURCHASING_CREATE_REQUISITION,
  MOBILE_PURCHASING_REQUISITION_BY_ID,
  MOBILE_PURCHASING_UPDATE_REQUISITION,
} from '../gql';
import { PurchasingPaths } from '../paths';
import { usePurchasingAccess } from '../use-purchasing-access';
import { CatalogPickerPopup } from './catalog-picker-popup';

interface LineValues {
  internalCatalogId?: string;
  description?: string;
  unit?: string;
  quantity?: string;
  estimatedUnitPrice?: string;
}

interface FormValues {
  title: string;
  purpose?: string;
  lines: LineValues[];
}

const toNumber = (value?: string) => {
  const number = Number(value);
  return value && Number.isFinite(number) ? number : undefined;
};

const REFRESH = ['mobilePurchasingPagedRequisitions', 'mobilePurchasingRequisitionById'];

/** Purchasing → Requisitions → new, or edit a draft. A small form: for long lists use the web. */
export const RequisitionFormScreen = () => {
  const { id } = useParams<{ id?: string }>();
  const editing = Boolean(id);
  const online = useOnlineStatus();
  const { user } = usePurchasingAccess();
  const back = useNavigateBack(editing ? PurchasingPaths.requisition(id ?? '') : PurchasingPaths.requisitions);
  const [form] = Form.useForm<FormValues>();
  const [neededBy, setNeededBy] = useState<Date | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [pickingLine, setPickingLine] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useQuery(MOBILE_PURCHASING_REQUISITION_BY_ID, {
    variables: { _id: id ?? '' },
    skip: !editing,
    fetchPolicy: 'network-only',
  });
  const [create] = useMutation(MOBILE_PURCHASING_CREATE_REQUISITION, { refetchQueries: REFRESH });
  const [update] = useMutation(MOBILE_PURCHASING_UPDATE_REQUISITION, { refetchQueries: REFRESH });

  const requisition = data?.purchasingRequisitionById;
  const savedNeededBy = requisition?.neededBy;
  // Show the saved date once the requisition has arrived.
  useEffect(() => {
    if (savedNeededBy) setNeededBy(new Date(Number(savedNeededBy)));
  }, [savedNeededBy]);
  const title = editing ? 'Edit requisition' : 'New requisition';

  if (editing && loading && !requisition) {
    return (
      <Page backTo={PurchasingPaths.requisition(id ?? '')} title={title}>
        <PageLoading />
      </Page>
    );
  }
  if (editing && !requisition) {
    return (
      <Page backTo={PurchasingPaths.requisition(id ?? '')} title={title}>
        <PageError error={error ?? new Error('Requisition not found.')} onRetry={() => refetch()} />
      </Page>
    );
  }
  if (requisition && requisition.status !== 'draft') {
    return (
      <Page backTo={PurchasingPaths.requisition(id ?? '')} title={title}>
        <PageError error={new Error('Only a draft can be edited.')} />
      </Page>
    );
  }

  const initialLines: LineValues[] = requisition?.lines?.length
    ? requisition.lines.map(line => ({
        internalCatalogId: line?.internalCatalogId ?? undefined,
        description: line?.description ?? '',
        unit: line?.unit ?? '',
        quantity: String(line?.quantity ?? ''),
        estimatedUnitPrice: line?.estimatedUnitPrice != null ? String(line.estimatedUnitPrice) : '',
      }))
    : [{ quantity: '1' }];

  const save = async (values: FormValues) => {
    const lines = (values.lines ?? []).map(line => ({
      internalCatalogId: line.internalCatalogId || undefined,
      description: line.description?.trim() || undefined,
      unit: line.unit?.trim() || undefined,
      quantity: toNumber(line.quantity) ?? 0,
      estimatedUnitPrice: toNumber(line.estimatedUnitPrice),
    }));
    if (lines.length === 0) {
      showWarning('Please add at least one item.');
      return;
    }
    if (lines.some(line => line.quantity <= 0)) {
      showWarning('Every item needs a quantity above zero.');
      return;
    }
    const common = {
      title: values.title.trim(),
      purpose: values.purpose?.trim() || undefined,
      requestedBy: requisition?.requestedBy ?? user?.karkun?._id ?? undefined,
      neededBy: neededBy ? toDateInput(neededBy) : undefined,
      lines,
    };

    setSaving(true);
    try {
      if (requisition) {
        await update({ variables: { _id: requisition._id ?? '', version: requisition.version ?? 0, ...common } });
      } else {
        await create({ variables: common });
      }
      showSuccess(editing ? 'Requisition saved.' : 'Draft saved.');
      back();
    } catch (saveError) {
      showError(saveError, 'Could not save the requisition.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page backTo={editing ? PurchasingPaths.requisition(id ?? '') : PurchasingPaths.requisitions} title={title}>
      <Form
        form={form}
        footer={
          <Button block color="primary" disabled={!online} loading={saving} type="submit">
            {editing ? 'Save changes' : 'Save draft'}
          </Button>
        }
        initialValues={{ title: requisition?.title ?? '', purpose: requisition?.purpose ?? '', lines: initialLines }}
        layout="vertical"
        mode="card"
        onFinish={save}
      >
        <Form.Item label="Title" name="title" rules={[{ required: true, message: 'Please enter a title.' }]}>
          <Input maxLength={200} placeholder="What is needed" />
        </Form.Item>
        <Form.Item label="Purpose" name="purpose">
          <TextArea autoSize={{ minRows: 2, maxRows: 5 }} maxLength={1000} placeholder="Why it is needed" />
        </Form.Item>
        <Form.Item arrowIcon label="Needed by" onClick={() => setDateOpen(true)}>
          <span>{neededBy ? formatDate(String(neededBy.getTime())) : 'Not set'}</span>
        </Form.Item>
        <DatePicker
          title="Needed by"
          value={neededBy ?? undefined}
          visible={dateOpen}
          onClose={() => setDateOpen(false)}
          onConfirm={setNeededBy}
        />

        <Form.Array
          name="lines"
          renderAdd={() => (
            <span>
              <AddCircleOutline /> Add item
            </span>
          )}
          renderHeader={({ index }, { remove }) => (
            <div className="purchasing-array-header">
              <span>Item {index + 1}</span>
              {index > 0 && (
                <Button color="danger" fill="none" size="mini" onClick={() => remove(index)}>
                  Remove
                </Button>
              )}
            </div>
          )}
          onAdd={operation => operation.add({ quantity: '1' })}
        >
          {fields =>
            fields.map(({ index }) => (
              <React.Fragment key={index}>
                <Form.Item name={[index, 'internalCatalogId']} hidden>
                  <Input />
                </Form.Item>
                <Form.Item
                  extra={
                    <Button size="mini" onClick={() => setPickingLine(index)}>
                      Catalog
                    </Button>
                  }
                  label="Description"
                  name={[index, 'description']}
                  rules={[{ required: true, message: 'Please describe the item.' }]}
                >
                  <Input maxLength={300} placeholder="Item name" />
                </Form.Item>
                <Form.Item label="Unit" name={[index, 'unit']}>
                  <Input maxLength={30} placeholder="e.g. kg, box, piece" />
                </Form.Item>
                <Form.Item label="Quantity" name={[index, 'quantity']} rules={[{ required: true, message: 'Please enter the quantity.' }]}>
                  <Input inputMode="decimal" type="number" />
                </Form.Item>
                <Form.Item label="Estimated unit price" name={[index, 'estimatedUnitPrice']}>
                  <Input inputMode="decimal" placeholder="Optional" type="number" />
                </Form.Item>
              </React.Fragment>
            ))
          }
        </Form.Array>
      </Form>

      <CatalogPickerPopup
        visible={pickingLine != null}
        onClose={() => setPickingLine(null)}
        onPick={item => {
          if (pickingLine == null) return;
          const lines = form.getFieldValue('lines') as LineValues[];
          const next = lines.map((line, index) =>
            index === pickingLine
              ? { ...line, internalCatalogId: item._id, description: item.name, unit: item.unit }
              : line
          );
          form.setFieldValue('lines', next);
        }}
      />
    </Page>
  );
};
