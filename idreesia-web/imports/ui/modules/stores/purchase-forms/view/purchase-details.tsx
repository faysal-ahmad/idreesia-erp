import React from 'react';
import dayjs from 'dayjs';
import { type History } from 'history';
import { type CSSProperties } from 'react';
import { Divider, Form } from 'antd';
import type { InventoryPurchaseFormByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { noop } from 'meteor/idreesia-common/utilities/lodash';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
import {
  InputTextField,
  DateField,
  FormButtonsClose,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';
import { ItemsList } from '../../common/items-list';

const FormStyle: CSSProperties = { width: '800px' };
const formItemExtendedLayout = { labelCol: { span: 0 }, wrapperCol: { span: 20 } };
type PurchaseForm = NonNullable<InventoryPurchaseFormByIdQuery['purchaseFormById']>;

interface Props {
  history: History;
  physicalStoreId: string;
  purchaseFormById: PurchaseForm;
}

const PurchaseDetails = ({ history, physicalStoreId, purchaseFormById }: Props) => (
  <>
    <Form layout="horizontal" style={FormStyle} onFinish={noop}>
      <DateField fieldName="purchaseDate" fieldLabel="Purchase Date" initialValue={dayjs(Number(purchaseFormById.purchaseDate))} required requiredMessage="Please input a purchase date." />
      <InputTextField fieldName="vendorId" fieldLabel="Vendor" initialValue={purchaseFormById.refVendor?.name ?? ''} />
      <InputTextField fieldName="receivedBy" fieldLabel="Received By" initialValue={purchaseFormById.refReceivedBy?.sharedData?.name ?? ''} required requiredMessage="Please input a name in received by." />
      <InputTextField fieldName="purchasedBy" fieldLabel="Purchased By" initialValue={purchaseFormById.refPurchasedBy?.sharedData?.name ?? ''} required requiredMessage="Please input a name in purchased by." />
      <InputTextAreaField fieldName="notes" fieldLabel="Notes" required={false} initialValue={purchaseFormById.notes ?? undefined} />
      <Divider titlePlacement="left">Purchased / Returned Items</Divider>
      <Form.Item name="items" initialValue={purchaseFormById.items ?? []} rules={[{ required: true, message: 'Please add some items.' }]} {...formItemExtendedLayout}>
        <ItemsList readOnly defaultLabel="Purchased" inflowLabel="Purchased" outflowLabel="Returned" showPrice physicalStoreId={physicalStoreId} />
      </Form.Item>
      <FormButtonsClose handleClose={() => history.goBack()} />
    </Form>
    <AuditInfo record={purchaseFormById} />
  </>
);

export default PurchaseDetails;
