import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, PlusOutlined, TagsOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Form, Input, InputNumber, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { Permissions } from 'meteor/idreesia-common/constants';

import {
  CREATE_PURCHASING_CATALOG_ITEM,
  PAGED_PURCHASING_CATALOG_ITEMS,
} from '../catalog/gql';
import { formatMoney } from './format';
import usePurchasingAccess from './use-purchasing-access';

export type LineVariant = 'requisition' | 'priced';

/** A line as the form holds it. */
export interface LineFormValue {
  _id?: string | null;
  catalogItemId?: string | null;
  // The name the catalog item had when it was picked. Typing a different
  // description turns the line back into a free-text line.
  catalogItemName?: string | null;
  orderLineId?: string | null;
  description?: string | null;
  unit?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  estimatedUnitPrice?: number | null;
  taxRate?: number | null;
}

interface ServerLine {
  _id?: string | null;
  catalogItemId?: string | null;
  orderLineId?: string | null;
  description?: string | null;
  unit?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  estimatedUnitPrice?: number | null;
  taxRate?: number | null;
}

/** Lines from the server, as form values. */
export const toLineFormValues = (
  lines: (ServerLine | null)[] | null | undefined
): LineFormValue[] =>
  (lines ?? []).filter((l): l is ServerLine => l != null).map((l) => ({
    _id: l._id,
    catalogItemId: l.catalogItemId,
    catalogItemName: l.catalogItemId ? l.description : undefined,
    orderLineId: l.orderLineId,
    description: l.description,
    unit: l.unit,
    quantity: l.quantity,
    unitPrice: l.unitPrice,
    estimatedUnitPrice: l.estimatedUnitPrice,
    taxRate: l.taxRate,
  }));

const baseLineInput = (l: LineFormValue) => ({
  _id: l._id ?? undefined,
  catalogItemId: l.catalogItemId ?? undefined,
  description: l.description ?? undefined,
  unit: l.unit ?? undefined,
  quantity: l.quantity ?? 0,
});

/** Requisition lines in the shape the mutations take. */
export const toRequisitionLineInput = (lines: LineFormValue[] | undefined) =>
  (lines ?? []).map((l) => ({
    ...baseLineInput(l),
    estimatedUnitPrice: l.estimatedUnitPrice ?? undefined,
  }));

/** Quote, order and invoice lines in the shape the mutations take. */
export const toPricedLineInput = (lines: LineFormValue[] | undefined) =>
  (lines ?? []).map((l) => ({
    ...baseLineInput(l),
    orderLineId: l.orderLineId ?? undefined,
    unitPrice: l.unitPrice ?? 0,
    taxRate: l.taxRate ?? undefined,
  }));

/** Subtotal, tax and total of the lines being edited. */
export function computeLineTotals(
  lines: LineFormValue[] | undefined,
  variant: LineVariant
) {
  let subtotal = 0;
  let taxTotal = 0;
  (lines ?? []).forEach((l) => {
    const price = (variant === 'requisition' ? l.estimatedUnitPrice : l.unitPrice) ?? 0;
    const net = Math.round((l.quantity ?? 0) * price * 100) / 100;
    subtotal += net;
    taxTotal += Math.round(((net * (l.taxRate ?? 0)) / 100) * 100) / 100;
  });
  subtotal = Math.round(subtotal * 100) / 100;
  taxTotal = Math.round(taxTotal * 100) / 100;
  return { subtotal, taxTotal, total: Math.round((subtotal + taxTotal) * 100) / 100 };
}

interface ItemCellProps {
  value?: string;
  onChange?: (value: string) => void;
  rowIndex: number;
  priceField: 'unitPrice' | 'estimatedUnitPrice';
  disabled?: boolean;
}

/**
 * The description of a line. Typing free text is always fine; picking a
 * catalog item fills in its unit and price.
 */
const ItemCell = ({ value, onChange, rowIndex, priceField, disabled }: ItemCellProps) => {
  const form = Form.useFormInstance();
  const [search, setSearch] = useState('');
  const text = search.trim();
  const { data } = useQuery(PAGED_PURCHASING_CATALOG_ITEMS, {
    variables: { search: text, isActive: true, pageIndex: 0, pageSize: 10 },
    skip: text.length === 0,
  });

  const items = (data?.pagedPurchasingCatalogItems?.data ?? []).filter(
    (i): i is NonNullable<typeof i> & { _id: string } => i?._id != null
  );
  const options = items.map((item) => ({
    value: item.name ?? '',
    label: `${item.name} (${item.unit})`,
    itemId: item._id,
  }));

  const setField = (field: string, fieldValue: unknown) =>
    form.setFieldValue(['lines', rowIndex, field], fieldValue);

  const handleSelect = (_: string, option: { itemId?: string }) => {
    const item = items.find((i) => i._id === option.itemId);
    if (!item) return;
    setField('catalogItemId', item._id);
    setField('catalogItemName', item.name);
    setField('unit', item.unit);
    const price = item.lastUnitPrice ?? item.defaultUnitPrice;
    const current = form.getFieldValue(['lines', rowIndex, priceField]);
    if (price != null && !current) setField(priceField, price);
  };

  const handleChange = (next: string) => {
    onChange?.(next);
    setSearch(next);
    const pickedName = form.getFieldValue(['lines', rowIndex, 'catalogItemName']);
    if (next !== pickedName) setField('catalogItemId', undefined);
  };

  return (
    <AutoComplete
      value={value}
      options={options}
      onSelect={handleSelect}
      onChange={handleChange}
      disabled={disabled}
      placeholder="Item (type or pick from the catalog)"
    />
  );
};

interface LineItemsEditorProps {
  variant: LineVariant;
  /** Show a tax-rate column (orders and invoices). */
  showTax?: boolean;
  disabled?: boolean;
  /** Lines come from elsewhere (e.g. an order): no adding or removing. */
  fixedLines?: boolean;
}

/**
 * The lines of a requisition, quote, order or invoice. Goes inside a Form
 * and edits the `lines` field. Every line is free text with an optional link
 * to a catalog item; a free-text line can be saved to the catalog.
 */
const LineItemsEditor = ({
  variant,
  showTax = false,
  disabled = false,
  fixedLines = false,
}: LineItemsEditorProps) => {
  const form = Form.useFormInstance();
  const { can } = usePurchasingAccess();
  const priceField = variant === 'requisition' ? 'estimatedUnitPrice' : 'unitPrice';
  const canAddToCatalog = can(Permissions.PURCHASING_MANAGE_CATALOG);
  const [createCatalogItem] = useMutation(CREATE_PURCHASING_CATALOG_ITEM, {
    refetchQueries: ['pagedPurchasingCatalogItems'],
  });

  const handleAddToCatalog = (rowIndex: number) => {
    const line = form.getFieldValue(['lines', rowIndex]) as LineFormValue;
    const name = line.description?.trim();
    const unit = line.unit?.trim();
    if (!name || !unit) {
      message.error('Enter the item and its unit first.', 3);
      return;
    }
    createCatalogItem({
      variables: {
        name,
        unit,
        defaultUnitPrice: (line[priceField] ?? undefined) || undefined,
      },
    })
      .then((result) => {
        form.setFieldValue(['lines', rowIndex, 'catalogItemId'], result.data?.createPurchasingCatalogItem?._id);
        form.setFieldValue(['lines', rowIndex, 'catalogItemName'], name);
        message.success(`"${name}" added to the catalog`, 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const gridTemplateColumns = `minmax(220px, 3fr) 90px 110px 130px ${showTax ? '90px ' : ''}120px 72px`;

  return (
    <Form.List name="lines">
      {(fields, { add, remove }) => (
        <div className="purchasing-lines">
          <div className="purchasing-lines-row purchasing-lines-head" style={{ gridTemplateColumns }}>
            <span>Item</span>
            <span>Unit</span>
            <span>Quantity</span>
            <span>{variant === 'requisition' ? 'Est. Price' : 'Unit Price'}</span>
            {showTax ? <span>Tax %</span> : null}
            <span style={{ textAlign: 'right' }}>Total</span>
            <span />
          </div>

          {fields.map(({ key, name }) => (
            <div
              key={key}
              className="purchasing-lines-row"
              style={{ gridTemplateColumns }}
            >
              <Form.Item name={[name, '_id']} hidden noStyle><Input /></Form.Item>
              <Form.Item name={[name, 'catalogItemId']} hidden noStyle><Input /></Form.Item>
              <Form.Item name={[name, 'catalogItemName']} hidden noStyle><Input /></Form.Item>
              <Form.Item name={[name, 'orderLineId']} hidden noStyle><Input /></Form.Item>

              <Form.Item
                name={[name, 'description']}
                rules={[{ required: true, message: 'Enter the item' }]}
              >
                <ItemCell
                  rowIndex={name}
                  priceField={priceField}
                  disabled={disabled || fixedLines}
                />
              </Form.Item>
              <Form.Item name={[name, 'unit']} rules={[{ required: true, message: 'Unit' }]}>
                <Input disabled={disabled || fixedLines} />
              </Form.Item>
              <Form.Item
                name={[name, 'quantity']}
                rules={[{ required: true, message: 'Quantity' }]}
              >
                <InputNumber min={0} precision={3} disabled={disabled} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name={[name, priceField]}>
                <InputNumber min={0} precision={2} disabled={disabled} style={{ width: '100%' }} />
              </Form.Item>
              {showTax ? (
                <Form.Item name={[name, 'taxRate']}>
                  <InputNumber min={0} max={100} precision={2} disabled={disabled} style={{ width: '100%' }} />
                </Form.Item>
              ) : null}
              <Form.Item noStyle shouldUpdate>
                {() => {
                  const line = form.getFieldValue(['lines', name]) as LineFormValue | undefined;
                  const price = (line?.[priceField] ?? 0) as number;
                  return (
                    <span className="purchasing-lines-total">
                      {formatMoney((line?.quantity ?? 0) * price)}
                    </span>
                  );
                }}
              </Form.Item>
              <span className="purchasing-lines-actions">
                {!disabled && !fixedLines && canAddToCatalog ? (
                  <Form.Item noStyle shouldUpdate>
                    {() =>
                      form.getFieldValue(['lines', name, 'catalogItemId']) ? null : (
                        <Tooltip title="Add to catalog">
                          <TagsOutlined
                            className="list-actions-icon"
                            onClick={() => handleAddToCatalog(name)}
                          />
                        </Tooltip>
                      )
                    }
                  </Form.Item>
                ) : null}
                {!disabled && !fixedLines ? (
                  <Tooltip title="Remove line">
                    <DeleteOutlined className="list-actions-icon" onClick={() => remove(name)} />
                  </Tooltip>
                ) : null}
              </span>
            </div>
          ))}

          {!disabled && !fixedLines ? (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() => add({ quantity: 1, taxRate: showTax ? 0 : undefined })}
            >
              Add line
            </Button>
          ) : null}
        </div>
      )}
    </Form.List>
  );
};

export default LineItemsEditor;
