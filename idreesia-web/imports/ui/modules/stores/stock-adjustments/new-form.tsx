import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { type History } from 'history';
import { type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import { usePhysicalStore } from '/imports/ui/modules/stores/common/hooks';
import {
  DateField,
  InputNumberField,
  RadioGroupField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { StockItemField } from '/imports/ui/modules/stores/stock-items/field';
import { CREATE_STOCK_ADJUSTMENT } from './gql';

const FormStyle: CSSProperties = { width: '800px' };

type RouteParams = { physicalStoreId: string };

interface KarkunOption { _id: string; name: string; }

export interface NewStockAdjustmentFormValues {
  stockItem: { _id: string };
  adjustmentDate: string;
  adjustedBy: KarkunOption;
  quantity: number;
  adjustment: 'inflow' | 'outflow';
  adjustmentReason?: string;
}

interface Props { history: History; }

const NewForm = ({ history }: Props) => {
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createStockAdjustment] = useMutation(CREATE_STOCK_ADJUSTMENT, {
    refetchQueries: ['pagedStockAdjustments', 'stockAdjustmentsByStockItem', 'pagedStockItems'],
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name, 'Stock Adjustments', 'New']
      : [ModuleNames.stores, 'Stock Adjustments', 'New']
  );

  const handleFinish = ({ stockItem, adjustmentDate, adjustedBy, quantity, adjustment, adjustmentReason }: NewStockAdjustmentFormValues) => {
    createStockAdjustment({
      variables: {
        physicalStoreId,
        stockItemId: stockItem._id,
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
    <Form layout="horizontal" style={FormStyle} onFinish={handleFinish} onFieldsChange={() => setIsFieldsTouched(true)}>
      <StockItemField physicalStoreId={physicalStoreId} fieldName="stockItem" fieldLabel="Stock Item Name" required requiredMessage="Please select a stock item." />
      <RadioGroupField fieldName="adjustment" fieldLabel="Adjustment" required options={[{ label: 'Increase by', value: 'inflow' }, { label: 'Decrease by', value: 'outflow' }]} />
      <InputNumberField fieldName="quantity" fieldLabel="Quantity" required requiredMessage="Please input a value for adjustment quantity." minValue={0} />
      <DateField fieldName="adjustmentDate" fieldLabel="Adjustment Date" required requiredMessage="Please input an adjustment date." />
      <KarkunField fieldName="adjustedBy" fieldLabel="Adjusted By" placeholder="Adjusted By" required requiredMessage="Please select a name for adjusted By." predefinedFilterStoreId={physicalStoreId} predefinedFilterName={PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY} />
      <InputTextAreaField fieldName="adjustmentReason" fieldLabel="Adjustment Reason" required={false} />
      <FormButtonsSaveCancel handleCancel={() => history.goBack()} isFieldsTouched={isFieldsTouched} />
    </Form>
  );
};

export default NewForm;
