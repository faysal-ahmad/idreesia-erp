import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { useMutation } from '@apollo/client/react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  InputTextField,
  InputNumberField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import {
  usePhysicalStore,
  usePhysicalStoreItemCategories,
} from '/imports/ui/modules/inventory/common/hooks';

import { CREATE_STOCK_ITEM } from './gql';
import allUnitOfMeasurements from './all-unit-of-measurements';

interface UnitOfMeasurement {
  _id: string;
  name: string;
}

interface StockItemFormValues {
  name: string;
  company?: string;
  details?: string;
  categoryId: string;
  unitOfMeasurement: string;
  minStockLevel?: number;
  currentStockLevel: number;
}

type Props = RouteComponentProps;

const NewForm = ({ history }: Props) => {
  const { physicalStoreId = '' } = useParams<{ physicalStoreId: string }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const {
    itemCategoriesByPhysicalStoreId,
    itemCategoriesByPhysicalStoreIdLoading,
  } = usePhysicalStoreItemCategories(physicalStoreId);
  const [createStockItem] = useMutation(CREATE_STOCK_ITEM, {
    refetchQueries: ['pagedStockItems'],
  });
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name ?? '', 'Stock Items', 'New']
      : ['Inventory', 'Stock Items', 'New']
  );

  const handleCancel = () => {
    history.goBack();
  };

  const handleFinish = ({
    name,
    company,
    details,
    categoryId,
    unitOfMeasurement,
    minStockLevel,
    currentStockLevel,
  }: StockItemFormValues) => {
    createStockItem({
      variables: {
        name,
        company,
        details,
        categoryId,
        unitOfMeasurement,
        physicalStoreId,
        minStockLevel,
        currentStockLevel,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (itemCategoriesByPhysicalStoreIdLoading) return null;

  const categories = (itemCategoriesByPhysicalStoreId ?? []).filter(
    (category): category is NonNullable<typeof category> => category != null
  );

  return (
    <Form
      layout="horizontal"
      onFinish={handleFinish}
      onFieldsChange={() => {
        setIsFieldsTouched(true);
      }}
    >
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the stock item."
      />
      <InputTextField fieldName="company" fieldLabel="Company" required={false} />
      <InputTextField fieldName="details" fieldLabel="Details" required={false} />
      <SelectField<NonNullable<(typeof categories)[number]>>
        data={categories}
        getDataValue={({ _id }) => _id ?? ''}
        getDataText={({ name: categoryName }) => categoryName ?? ''}
        fieldName="categoryId"
        fieldLabel="Category"
        required
        requiredMessage="Please select an item category."
      />
      <SelectField<UnitOfMeasurement>
        data={allUnitOfMeasurements}
        getDataValue={({ _id }) => _id}
        getDataText={({ name: unitName }) => unitName}
        fieldName="unitOfMeasurement"
        fieldLabel="Measurement Unit"
        required
        requiredMessage="Please select a unit of measurement."
      />
      <InputNumberField
        required
        requiredMessage="Please set the current stock level."
        fieldName="currentStockLevel"
        fieldLabel="Current Stock Level"
      />
      <InputNumberField fieldName="minStockLevel" fieldLabel="Min Stock Level" />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default NewForm;
