import React from 'react';
import { useQuery } from '@apollo/client/react';
import dayjs from 'dayjs';
import { type History } from 'history';
import { type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { Form } from 'antd';
import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import { usePhysicalStore } from '/imports/ui/modules/stores/common/hooks';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
import {
  InputTextField,
  DateField,
  FormButtonsClose,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';
import { VIEW_STOCK_ADJUSTMENT_BY_ID } from './gql';

const FormStyle: CSSProperties = { width: '800px' };
type RouteParams = { formId: string; physicalStoreId: string };
interface Props { history: History; }

const ViewForm = ({ history }: Props) => {
  const { formId, physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { data, loading } = useQuery(VIEW_STOCK_ADJUSTMENT_BY_ID, {
    skip: !formId,
    variables: { _id: formId, physicalStoreId },
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name, 'Stock Adjustments', 'View']
      : [ModuleNames.stores, 'Stock Adjustments', 'View']
  );

  if (loading || !data?.stockAdjustmentById) return null;
  const stockAdjustmentById = data.stockAdjustmentById;
  const adjustment = stockAdjustmentById.isInflow
    ? `Increased by ${stockAdjustmentById.quantity}`
    : `Decreased by ${stockAdjustmentById.quantity}`;

  return (
    <>
      <Form layout="horizontal" style={FormStyle} onFinish={noop}>
        <InputTextField fieldName="stockItemId" fieldLabel="Stock Item Name" initialValue={stockAdjustmentById.refStockItem?.formattedName ?? ''} />
        <InputTextField fieldName="adjustment" fieldLabel="Adjustment" initialValue={adjustment} />
        <InputTextField fieldName="adjustedBy" fieldLabel="Adjusted By" initialValue={stockAdjustmentById.refAdjustedBy?.sharedData?.name ?? ''} />
        <DateField fieldName="adjustedDate" fieldLabel="Adjusted Date" initialValue={dayjs(Number(stockAdjustmentById.adjustmentDate))} />
        <InputTextAreaField fieldName="adjustmentReason" fieldLabel="Adjustment Reason" initialValue={stockAdjustmentById.adjustmentReason ?? undefined} />
        <FormButtonsClose handleClose={() => history.goBack()} />
      </Form>
      <AuditInfo record={stockAdjustmentById} />
    </>
  );
};

export default ViewForm;
