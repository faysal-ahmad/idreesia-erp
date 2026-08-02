import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { type History } from 'history';
import { type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { Form, message } from 'antd';
import type { EditStockAdjustmentByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
import {
  DateField,
  InputTextField,
  InputNumberField,
  RadioGroupField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import {
  EDIT_STOCK_ADJUSTMENT_BY_ID,
  UPDATE_STOCK_ADJUSTMENT,
} from './gql';

const FormStyle: CSSProperties = { width: '800px' };
type StockAdjustment = NonNullable<EditStockAdjustmentByIdQuery['stockAdjustmentById']>;
type RouteParams = { formId: string; physicalStoreId: string };
interface KarkunOption { _id: string; name: string; }

export interface EditStockAdjustmentFormValues {
  adjustmentDate: string;
  adjustedBy: KarkunOption;
  quantity: number;
  adjustment: 'inflow' | 'outflow';
  adjustmentReason?: string;
}

interface Props { history: History; }

const EditForm = ({ history }: Props) => {
  const { formId, physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { data, loading } = useQuery(EDIT_STOCK_ADJUSTMENT_BY_ID, {
    skip: !formId,
    variables: { _id: formId, physicalStoreId },
  });
  const [updateStockAdjustment] = useMutation(UPDATE_STOCK_ADJUSTMENT, {
    refetchQueries: ['pagedStockAdjustments', 'stockAdjustmentsByStockItem', 'pagedStockItems'],
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name, 'Stock Adjustments', 'Edit']
      : ['Inventory', 'Stock Adjustments', 'Edit']
  );

  if (loading || !data?.stockAdjustmentById) return null;
  const stockAdjustmentById = data.stockAdjustmentById;

  const handleFinish = ({ adjustmentDate, adjustedBy, quantity, adjustment, adjustmentReason }: EditStockAdjustmentFormValues) => {
    updateStockAdjustment({
      variables: {
        _id: stockAdjustmentById._id as string,
        physicalStoreId,
        adjustmentDate,
        adjustedBy: adjustedBy._id,
        quantity,
        isInflow: adjustment === 'inflow',
        adjustmentReason,
      },
    })
      .then(() => history.goBack())
      .catch((error: Error) => message.error(error.message, 5));
  };

  return (
    <>
      <Form layout="horizontal" style={FormStyle} onFinish={handleFinish} onFieldsChange={() => setIsFieldsTouched(true)}>
        <InputTextField fieldName="stockItemId" fieldLabel="Stock Item Name" initialValue={stockAdjustmentById.refStockItem?.formattedName ?? ''} />
        <RadioGroupField fieldName="adjustment" fieldLabel="Adjustment" initialValue={stockAdjustmentById.isInflow ? 'inflow' : 'outflow'} options={[{ label: 'Increase by', value: 'inflow' }, { label: 'Decrease by', value: 'outflow' }]} />
        <InputNumberField fieldName="quantity" fieldLabel="Quantity" initialValue={stockAdjustmentById.quantity ?? undefined} required requiredMessage="Please input a value for adjustment quantity." minValue={0} />
        <DateField fieldName="adjustmentDate" fieldLabel="Adjustment Date" initialValue={dayjs(Number(stockAdjustmentById.adjustmentDate))} required requiredMessage="Please input an adjustment date." />
        <KarkunField fieldName="adjustedBy" fieldLabel="Adjusted By" placeholder="Adjusted By" required requiredMessage="Please select a name for adjusted By." initialValue={stockAdjustmentById.refAdjustedBy ?? undefined} predefinedFilterStoreId={physicalStoreId} predefinedFilterName={PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY} />
        <InputTextAreaField fieldName="adjustmentReason" fieldLabel="Adjustment Reason" initialValue={stockAdjustmentById.adjustmentReason ?? undefined} required={false} />
        <FormButtonsSaveCancel handleCancel={() => history.goBack()} isFieldsTouched={isFieldsTouched} />
      </Form>
      <AuditInfo record={stockAdjustmentById} />
    </>
  );
};

export default EditForm;
