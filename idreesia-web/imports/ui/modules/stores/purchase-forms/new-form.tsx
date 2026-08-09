import React, { useRef, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { type History } from 'history';
import { type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { Divider, Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import {
  usePhysicalStore,
  usePhysicalStoreLocations,
  usePhysicalStoreVendors,
} from '/imports/ui/modules/stores/common/hooks';
import {
  DateField,
  SelectField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  TreeSelectField,
} from '/imports/ui/modules/helpers/fields';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { ItemsList } from '../common/items-list';
import { CREATE_PURCHASE_FORM } from './gql';

const FormStyle: CSSProperties = {
  width: '800px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

type RouteParams = { physicalStoreId: string };

interface VendorOption { _id: string | null; name: string | null; }
interface LocationOption { _id: string | null; name: string | null; }
interface KarkunOption { _id: string; name: string; }

export interface NewPurchaseFormValues {
  purchaseDate: string;
  locationId?: string;
  vendorId?: string;
  receivedBy: KarkunOption;
  purchasedBy: KarkunOption;
  items?: unknown[];
  notes?: string;
}

interface Props { history: History; }

const NewForm = ({ history }: Props) => {
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { vendorsByPhysicalStoreId, vendorsByPhysicalStoreIdLoading } =
    usePhysicalStoreVendors(physicalStoreId);
  const { locationsByPhysicalStoreId, locationsByPhysicalStoreIdLoading } =
    usePhysicalStoreLocations(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const formRef = useRef<{ getFieldsValue(): unknown; resetFields(names: string[]): void }>(null);
  const [createPurchaseForm] = useMutation(CREATE_PURCHASE_FORM, {
    refetchQueries: [
      'pagedPurchaseForms',
      'purchaseFormsByStockItem',
      'pagedStockItems',
      'vendorsByPhysicalStoreId',
      'purchaseFormsByMonth',
    ],
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name, 'Purchase Forms', 'New']
      : [ModuleNames.stores, 'Purchase Forms', 'New']
  );

  if (locationsByPhysicalStoreIdLoading || vendorsByPhysicalStoreIdLoading) {
    return null;
  }

  const handleFinish = ({
    purchaseDate,
    locationId,
    vendorId,
    receivedBy,
    purchasedBy,
    items,
    notes,
  }: NewPurchaseFormValues) => {
    createPurchaseForm({
      variables: {
        purchaseDate,
        locationId,
        vendorId,
        receivedBy: receivedBy._id,
        purchasedBy: purchasedBy._id,
        physicalStoreId,
        items: items as Parameters<typeof createPurchaseForm>[0]['variables']['items'],
        notes,
      },
    })
      .then(() => history.goBack())
      .catch((error: Error) => message.error(error.message, 5));
  };

  return (
    <Form
      ref={formRef as React.RefObject<never>}
      layout="horizontal"
      style={FormStyle}
      onFinish={handleFinish}
      onFieldsChange={() => setIsFieldsTouched(true)}
    >
      <DateField fieldName="purchaseDate" fieldLabel="Purchase Date" required requiredMessage="Please input a purchase date." />
      <KarkunField required requiredMessage="Please select a name for Received By / Returned By." fieldName="receivedBy" fieldLabel="Received By / Returned By" placeholder="Received By / Returned By" predefinedFilterStoreId={physicalStoreId} predefinedFilterName={PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY} />
      <KarkunField required requiredMessage="Please select a name for Purchased By / Returned To." fieldName="purchasedBy" fieldLabel="Purchased By / Returned To" placeholder="Purchased By / Returned To" predefinedFilterStoreId={physicalStoreId} predefinedFilterName={PredefinedFilterNames.PURCHASE_FORMS_PURCHASED_BY_RETURNED_TO} />
      <SelectField<VendorOption> data={(vendorsByPhysicalStoreId ?? []) as VendorOption[]} getDataValue={({ _id }) => _id ?? ''} getDataText={({ name }) => name ?? ''} fieldName="vendorId" fieldLabel="Vendor" />
      <TreeSelectField data={(locationsByPhysicalStoreId ?? []) as LocationOption[]} showSearch fieldName="locationId" fieldLabel="For Location" placeholder="Select a Location" />
      <InputTextAreaField fieldName="notes" fieldLabel="Notes" required={false} />
      <Divider titlePlacement="left">Purchased / Returned Items</Divider>
      <Form.Item name="items" rules={[{ required: true, message: 'Please add some items.' }]} {...formItemExtendedLayout}>
        <ItemsList showPrice defaultLabel="Purchased" inflowLabel="Purchased" outflowLabel="Returned" physicalStoreId={physicalStoreId} refForm={formRef.current as never} />
      </Form.Item>
      <FormButtonsSaveCancel handleCancel={() => history.goBack()} isFieldsTouched={isFieldsTouched} />
    </Form>
  );
};

export default NewForm;
