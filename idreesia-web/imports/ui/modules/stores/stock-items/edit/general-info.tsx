import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation } from '@apollo/client/react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import type {
  ItemCategoriesByPhysicalStoreIdQuery,
  StockItemByIdQuery,
} from 'meteor/idreesia-common/types/client-operations';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
import {
  InputTextField,
  InputNumberField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import allUnitOfMeasurements from '../all-unit-of-measurements';
import { UPDATE_STOCK_ITEM } from '../gql';

interface UnitOfMeasurement {
  _id: string;
  name: string;
}

type StockItem = NonNullable<StockItemByIdQuery['stockItemById']>;

type ItemCategory = NonNullable<
  NonNullable<
    ItemCategoriesByPhysicalStoreIdQuery['itemCategoriesByPhysicalStoreId']
  >[number]
>;

interface StockItemFormValues {
  name: string;
  company?: string;
  details?: string;
  categoryId?: string;
  unitOfMeasurement?: string;
  minStockLevel?: number;
}

interface Props {
  history: History;
  stockItemById: StockItem;
  itemCategoriesByPhysicalStoreId: ItemCategory[];
}

const GeneralInfo = ({
  history,
  stockItemById,
  itemCategoriesByPhysicalStoreId,
}: Props) => {
  const [updateStockItem] = useMutation(UPDATE_STOCK_ITEM, {
    refetchQueries: ['pagedStockItems'],
  });
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

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
  }: StockItemFormValues) => {
    if (!stockItemById._id || !stockItemById.physicalStoreId) return;

    updateStockItem({
      variables: {
        _id: stockItemById._id,
        physicalStoreId: stockItemById.physicalStoreId,
        name,
        company,
        details,
        categoryId: categoryId ?? '',
        unitOfMeasurement: unitOfMeasurement ?? '',
        minStockLevel,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <>
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
          initialValue={stockItemById.name}
          required
          requiredMessage="Please input a name for the stock item."
        />
        <InputTextField
          fieldName="company"
          fieldLabel="Company"
          initialValue={stockItemById.company}
          required={false}
        />
        <InputTextField
          fieldName="details"
          fieldLabel="Details"
          initialValue={stockItemById.details}
          required={false}
        />
        <SelectField<ItemCategory>
          data={itemCategoriesByPhysicalStoreId}
          getDataValue={({ _id }) => _id ?? ''}
          getDataText={({ name }) => name ?? ''}
          fieldName="categoryId"
          fieldLabel="Category"
          required
          requiredMessage="Please select an item category."
          initialValue={stockItemById.categoryId}
        />
        <SelectField<UnitOfMeasurement>
          data={allUnitOfMeasurements}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="unitOfMeasurement"
          fieldLabel="Measurement Unit"
          required
          requiredMessage="Please select a unit of measurement."
          initialValue={stockItemById.unitOfMeasurement}
        />
        <InputNumberField
          disabled
          fieldName="startingStockLevel"
          fieldLabel="Starting Stock Level"
          initialValue={stockItemById.startingStockLevel}
        />
        <InputNumberField
          disabled
          fieldName="currentStockLevel"
          fieldLabel="Current Stock Level"
          initialValue={stockItemById.currentStockLevel ?? undefined}
        />
        <InputNumberField
          fieldName="minStockLevel"
          fieldLabel="Min Stock Level"
          initialValue={stockItemById.minStockLevel}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={stockItemById} />
    </>
  );
};

export default GeneralInfo;
