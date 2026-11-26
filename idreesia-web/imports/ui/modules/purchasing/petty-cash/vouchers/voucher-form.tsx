import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox, Collapse, Empty, Form, Input, InputNumber, Modal, Select, Spin } from 'antd';
import dayjs from 'dayjs';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import useReferencePhysicalStores from 'meteor/idreesia-common/hooks/reference-data/use-reference-physical-stores';
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';

import { formatMoney, toDateInput, toDayjs } from '../../common/format';
import RecordSelect from '../../common/record-select';
import VendorSelect from '../../common/vendor-select';
import { default as paths } from '../../submodule-paths';
import {
  CREATE_PURCHASING_PETTY_CASH_VOUCHER,
  PAGED_PURCHASING_PETTY_CASH_EXPENSE_HEADS,
  PAGED_PURCHASING_PETTY_CASH_FUNDS,
  PURCHASING_PETTY_CASH_VOUCHER_BY_ID,
  REFERENCE_STOCK_ITEMS,
  UPDATE_PURCHASING_PETTY_CASH_VOUCHER,
} from '../gql';

interface LineValues {
  _id?: string;
  description?: string;
  unit?: string;
  quantity?: number | null;
  unitPrice?: number | null;
  // Form only: whether the item goes into a store's stock.
  addToStore?: boolean;
  physicalStoreId?: string;
  externalCatalogId?: string;
  stockItemName?: string;
}

interface FormValues {
  fundId?: string;
  expenseHeadId?: string;
  voucherDate?: dayjs.Dayjs | null;
  payee?: string;
  vendorId?: string;
  purpose?: string;
  lines: LineValues[];
}

const ROW_COLUMNS = 'minmax(180px, 1fr) 90px 110px 120px 110px 32px';

/** The store and item a line adds to, when it is stock rather than an expense. */
const StockTarget = ({ rowIndex }: { rowIndex: number }) => {
  const form = Form.useFormInstance();
  const { referencePhysicalStores } = useReferencePhysicalStores();
  const [search, setSearch] = useState('');
  const storeId = Form.useWatch(['lines', rowIndex, 'physicalStoreId'], form);
  const itemId = Form.useWatch(['lines', rowIndex, 'externalCatalogId'], form);
  const itemName = Form.useWatch(['lines', rowIndex, 'stockItemName'], form);
  const { data, loading } = useQuery(REFERENCE_STOCK_ITEMS, {
    variables: { physicalStoreId: storeId ?? '', name: search || undefined },
    skip: !storeId,
  });

  const setField = (field: string, value: unknown) => form.setFieldValue(['lines', rowIndex, field], value);
  const items = (data?.referenceStockItems ?? []).filter((i): i is NonNullable<typeof i> => i?._id != null);
  const options = items.map((i) => ({ value: i._id as string, label: `${i.name} (${i.unitOfMeasurement})` }));
  if (itemId && itemName && !options.some((o) => o.value === itemId)) {
    options.unshift({ value: itemId, label: itemName });
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 8, margin: '0 0 8px 16px' }}>
      <Select
        placeholder="Store"
        value={storeId}
        options={(referencePhysicalStores ?? [])
          .filter((s): s is NonNullable<typeof s> => s?._id != null)
          .map((s) => ({ value: s._id as string, label: s.name ?? '' }))}
        onChange={(value) => {
          setField('physicalStoreId', value);
          setField('externalCatalogId', undefined);
          setField('stockItemName', undefined);
        }}
      />
      <Select
        showSearch
        filterOption={false}
        placeholder={storeId ? 'Stock item' : 'Choose the store first'}
        disabled={!storeId}
        loading={loading}
        value={itemId}
        options={options}
        onSearch={setSearch}
        onChange={(value) => {
          const item = items.find((i) => i._id === value);
          setField('externalCatalogId', value);
          setField('stockItemName', item?.name);
          if (item?.unitOfMeasurement) setField('unit', item.unitOfMeasurement);
          if (!form.getFieldValue(['lines', rowIndex, 'description'])) setField('description', item?.name);
        }}
      />
    </div>
  );
};

const LinesEditor = () => {
  const form = Form.useFormInstance();
  const lines: LineValues[] | undefined = Form.useWatch('lines', form);
  const total = (lines ?? []).reduce(
    (sum, l) => sum + Math.round((l?.quantity ?? 0) * (l?.unitPrice ?? 0) * 100) / 100,
    0
  );

  return (
    <Form.List name="lines">
      {(fields, { add, remove }) => (
        <div className="purchasing-lines">
          <div className="purchasing-lines-row purchasing-lines-head" style={{ gridTemplateColumns: ROW_COLUMNS }}>
            <span>Item</span>
            <span>Unit</span>
            <span>Quantity</span>
            <span>Price</span>
            <span style={{ textAlign: 'right' }}>Amount</span>
            <span />
          </div>
          {fields.map(({ key, name }) => {
            const line = lines?.[name];
            const amount = Math.round((line?.quantity ?? 0) * (line?.unitPrice ?? 0) * 100) / 100;
            return (
              <div key={key}>
                <div className="purchasing-lines-row" style={{ gridTemplateColumns: ROW_COLUMNS }}>
                  <Form.Item name={[name, '_id']} hidden noStyle><Input /></Form.Item>
                  <Form.Item name={[name, 'stockItemName']} hidden noStyle><Input /></Form.Item>
                  <Form.Item name={[name, 'description']} rules={[{ required: true, message: 'Required' }]}>
                    <Input placeholder="What was bought" />
                  </Form.Item>
                  <Form.Item name={[name, 'unit']}><Input placeholder="each" /></Form.Item>
                  <Form.Item name={[name, 'quantity']} rules={[{ required: true, message: 'Required' }]}>
                    <InputNumber min={0} precision={3} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name={[name, 'unitPrice']} rules={[{ required: true, message: 'Required' }]}>
                    <InputNumber min={0} precision={2} style={{ width: '100%' }} />
                  </Form.Item>
                  <div style={{ textAlign: 'right', paddingTop: 5 }}>{formatMoney(amount)}</div>
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    title="Remove line"
                    onClick={() => remove(name)}
                    disabled={fields.length === 1}
                  />
                </div>
                <div style={{ margin: '0 0 6px 16px' }}>
                  <Form.Item name={[name, 'addToStore']} valuePropName="checked" noStyle>
                    <Checkbox
                      onChange={(event) => {
                        if (!event.target.checked) {
                          form.setFieldValue(['lines', name, 'physicalStoreId'], undefined);
                          form.setFieldValue(['lines', name, 'externalCatalogId'], undefined);
                          form.setFieldValue(['lines', name, 'stockItemName'], undefined);
                        }
                      }}
                    >
                      Add to a store's stock
                    </Checkbox>
                  </Form.Item>
                </div>
                {line?.addToStore ? <StockTarget rowIndex={name} /> : null}
              </div>
            );
          })}
          <div className="purchasing-lines-actions">
            <Button icon={<PlusOutlined />} onClick={() => add({ quantity: 1 })}>
              Add Line
            </Button>
            <span className="purchasing-lines-total">Total: {formatMoney(total)}</span>
          </div>
        </div>
      )}
    </Form.List>
  );
};

const VoucherForm = ({ history, match }: RouteComponentProps<{ voucherId?: string }>) => {
  const { voucherId } = match.params;
  const isEdit = !!voucherId;
  useDynamicBreadcrumbs(['Purchasing', 'Petty Cash Vouchers', isEdit ? 'Edit' : 'New']);

  const { data, loading } = useQuery(PURCHASING_PETTY_CASH_VOUCHER_BY_ID, {
    variables: { _id: voucherId ?? '' },
    skip: !isEdit,
    fetchPolicy: 'network-only',
  });
  const voucher = data?.purchasingPettyCashVoucherById;
  const refetchQueries = ['pagedPurchasingPettyCashVouchers', 'purchasingPettyCashVoucherById'];
  const [createVoucher, { loading: creating }] = useMutation(CREATE_PURCHASING_PETTY_CASH_VOUCHER, { refetchQueries });
  const [updateVoucher, { loading: updating }] = useMutation(UPDATE_PURCHASING_PETTY_CASH_VOUCHER, { refetchQueries });

  if (isEdit && loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (isEdit && !voucher?._id) return <Empty description="Voucher not found" style={{ padding: '80px 0' }} />;
  if (voucher && !['draft', 'rejected'].includes(voucher.status ?? '')) {
    return <Empty description="Only a draft or rejected voucher can be edited." style={{ padding: '80px 0' }} />;
  }

  const handleFinish = async (values: FormValues) => {
    const lines = (values.lines ?? []).map((l) => ({
      _id: l._id,
      description: l.description ?? '',
      unit: l.unit || undefined,
      quantity: l.quantity ?? 0,
      unitPrice: l.unitPrice ?? 0,
      physicalStoreId: l.addToStore ? l.physicalStoreId : undefined,
      externalCatalogId: l.addToStore ? l.externalCatalogId : undefined,
    }));
    const common = {
      expenseHeadId: values.expenseHeadId!,
      voucherDate: toDateInput(values.voucherDate)!,
      payee: values.payee,
      vendorId: values.vendorId,
      purpose: values.purpose,
      lines,
    };
    const request = isEdit
      ? updateVoucher({ variables: { _id: voucherId!, ...common } })
      : createVoucher({ variables: { fundId: values.fundId!, ...common } });
    const result = await request.catch((error: Error) => {
      Modal.error({ title: 'Could not save the voucher', content: error.message });
      return null;
    });
    const saved = result?.data as any;
    const id = saved?.createPurchasingPettyCashVoucher?._id ?? saved?.updatePurchasingPettyCashVoucher?._id;
    if (id) history.replace(paths.pettyCashVoucherViewPath(id));
  };

  const initialLines: LineValues[] = voucher
    ? (voucher.lines ?? [])
        .filter((l): l is NonNullable<typeof l> => l != null)
        .map((l) => ({
          _id: l._id ?? undefined,
          description: l.description ?? undefined,
          unit: l.unit ?? undefined,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          addToStore: !!l.externalCatalogId,
          physicalStoreId: l.physicalStoreId ?? undefined,
          externalCatalogId: l.externalCatalogId ?? undefined,
          stockItemName: l.stockItemName ?? undefined,
        }))
    : [{ quantity: 1 }];

  return (
    <div className="purchasing-document">
      <Form
        layout="horizontal"
        onFinish={handleFinish}
        initialValues={{ lines: initialLines }}
      >
        <Collapse
          className="visitor-form-sections"
          defaultActiveKey={['general', 'items']}
          items={[
            {
              key: 'general',
              label: 'Voucher',
              forceRender: true,
              children: (
                <>
                  <Form.Item
                    name="fundId"
                    label="Fund"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 14 }}
                    initialValue={voucher?.fundId}
                    rules={[{ required: true, message: 'Please choose the fund.' }]}
                  >
                    <RecordSelect
                      query={PAGED_PURCHASING_PETTY_CASH_FUNDS}
                      dataKey="pagedPurchasingPettyCashFunds"
                      variables={{ isActive: true }}
                      labelOf={(f) => (f.name ? `${f.name} (balance ${formatMoney(f.balance)})` : '')}
                      selected={voucher?.fund}
                      disabled={isEdit}
                      allowClear={false}
                      placeholder="Choose the fund the cash comes from"
                    />
                  </Form.Item>
                  <Form.Item
                    name="expenseHeadId"
                    label="Expense Head"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 14 }}
                    initialValue={voucher?.expenseHeadId}
                    rules={[{ required: true, message: 'Please choose the expense head.' }]}
                  >
                    <RecordSelect
                      query={PAGED_PURCHASING_PETTY_CASH_EXPENSE_HEADS}
                      dataKey="pagedPurchasingPettyCashExpenseHeads"
                      variables={{ isActive: true }}
                      labelOf={(h) => h.name ?? ''}
                      selected={voucher?.expenseHead}
                      allowClear={false}
                      placeholder="What this spending is booked to"
                    />
                  </Form.Item>
                  <DateField
                    fieldName="voucherDate"
                    fieldLabel="Date"
                    initialValue={toDayjs(voucher?.voucherDate) ?? dayjs()}
                    required
                    requiredMessage="Please choose the date."
                  />
                  <InputTextField fieldName="payee" fieldLabel="Paid To" initialValue={voucher?.payee} />
                  <Form.Item
                    name="vendorId"
                    label="Vendor"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 14 }}
                    initialValue={voucher?.vendorId}
                  >
                    <VendorSelect selected={voucher?.vendor} placeholder="Optional - a registered vendor" />
                  </Form.Item>
                  <InputTextAreaField fieldName="purpose" fieldLabel="Purpose" initialValue={voucher?.purpose} />
                </>
              ),
            },
            {
              key: 'items',
              label: 'Items Bought',
              forceRender: true,
              children: <LinesEditor />,
            },
          ]}
        />
        <FormButtonsSaveCancel
          fullWidth
          handleCancel={() =>
            history.push(isEdit ? paths.pettyCashVoucherViewPath(voucherId) : paths.pettyCashVouchersPath)
          }
          isFieldsTouched={!(creating || updating)}
        />
      </Form>
    </div>
  );
};

export default VoucherForm;
