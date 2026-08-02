import React, { useRef, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import dayjs from 'dayjs';
import { type History } from 'history';
import { type CSSProperties } from 'react';
import { Divider, Form, message } from 'antd';
import type { InventoryPurchaseFormByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
import {
  DateField,
  SelectField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  TreeSelectField,
} from '/imports/ui/modules/helpers/fields';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { ItemsList } from '../../common/items-list';
import { UPDATE_PURCHASE_FORM } from '../gql';

const FormStyle: CSSProperties = { width: '900px' };
const formItemExtendedLayout = { labelCol: { span: 0 }, wrapperCol: { span: 20 } };

type PurchaseForm = NonNullable<InventoryPurchaseFormByIdQuery['purchaseFormById']>;
interface KarkunOption { _id: string; name: string; }
interface LocationOption { _id: string | null; name: string | null; }
interface VendorOption { _id: string | null; name: string | null; }
interface PurchaseItem { stockItemId: string; quantity: number; isInflow: boolean; price?: number; }

export interface PurchaseDetailsFormValues {
  purchaseDate: string;
  locationId?: string;
  vendorId?: string;
  receivedBy: KarkunOption;
  purchasedBy: KarkunOption;
  items: PurchaseItem[];
  notes?: string;
}

interface Props {
  history: History;
  physicalStoreId: string;
  purchaseFormById: PurchaseForm;
  locationsByPhysicalStoreId: LocationOption[];
  vendorsByPhysicalStoreId: VendorOption[];
}

const PurchaseDetails = ({
  history,
  physicalStoreId,
  purchaseFormById,
  locationsByPhysicalStoreId,
  vendorsByPhysicalStoreId,
}: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const formRef = useRef<{ getFieldsValue(): unknown; resetFields(names: string[]): void }>(null);
  const [updatePurchaseForm] = useMutation(UPDATE_PURCHASE_FORM, {
    refetchQueries: ['pagedPurchaseForms', 'purchaseFormsByStockItem', 'pagedStockItems', 'vendorsByPhysicalStoreId', 'purchaseFormsByMonth'],
  });

  const handleFinish = ({ purchaseDate, locationId, vendorId, receivedBy, purchasedBy, items, notes }: PurchaseDetailsFormValues) => {
    updatePurchaseForm({
      variables: {
        _id: purchaseFormById._id as string,
        physicalStoreId,
        purchaseDate,
        locationId,
        vendorId,
        receivedBy: receivedBy._id,
        purchasedBy: purchasedBy._id,
        items: items.map(({ stockItemId, quantity, isInflow, price }) => ({ stockItemId, quantity, isInflow, price })),
        notes,
      },
    })
      .then(() => history.goBack())
      .catch((error: Error) => message.error(error.message, 5));
  };

  return (
    <>
      <Form ref={formRef as React.RefObject<never>} layout="horizontal" style={FormStyle} onFinish={handleFinish} onFieldsChange={() => setIsFieldsTouched(true)}>
        <DateField fieldName="purchaseDate" fieldLabel="Purchase Date" initialValue={dayjs(Number(purchaseFormById.purchaseDate))} required requiredMessage="Please input a purchase date." />
        <KarkunField required requiredMessage="Please select a name for Received By / Returned By." fieldName="receivedBy" fieldLabel="Received By / Returned By" placeholder="Received By / Returned By" initialValue={purchaseFormById.refReceivedBy ?? undefined} predefinedFilterStoreId={physicalStoreId} predefinedFilterName={PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY} />
        <KarkunField required requiredMessage="Please select a name for Purchased By / Returned To." fieldName="purchasedBy" fieldLabel="Purchased By / Returned To" placeholder="Purchased By / Returned To" initialValue={purchaseFormById.refPurchasedBy ?? undefined} predefinedFilterStoreId={physicalStoreId} predefinedFilterName={PredefinedFilterNames.PURCHASE_FORMS_PURCHASED_BY_RETURNED_TO} />
        <SelectField<VendorOption> data={vendorsByPhysicalStoreId as VendorOption[]} getDataValue={({ _id }) => _id ?? ''} getDataText={({ name }) => name ?? ''} fieldName="vendorId" fieldLabel="Vendor" initialValue={purchaseFormById.vendorId ?? undefined} />
        <TreeSelectField data={locationsByPhysicalStoreId as LocationOption[]} showSearch fieldName="locationId" fieldLabel="For Location" placeholder="Select a Location" initialValue={purchaseFormById.locationId ?? undefined} />
        <InputTextAreaField fieldName="notes" fieldLabel="Notes" required={false} initialValue={purchaseFormById.notes ?? undefined} />
        <Divider orientation="left">Purchased / Returned Items</Divider>
        <Form.Item name="items" initialValue={purchaseFormById.items ?? []} rules={[{ required: true, message: 'Please add some items.' }]} {...formItemExtendedLayout}>
          <ItemsList showPrice defaultLabel="Purchased" inflowLabel="Purchased" outflowLabel="Returned" physicalStoreId={physicalStoreId} refForm={formRef.current as never} />
        </Form.Item>
        <FormButtonsSaveCancel handleCancel={() => history.goBack()} isFieldsTouched={isFieldsTouched} />
      </Form>
      <AuditInfo record={purchaseFormById} />
    </>
  );
};

export default PurchaseDetails;
