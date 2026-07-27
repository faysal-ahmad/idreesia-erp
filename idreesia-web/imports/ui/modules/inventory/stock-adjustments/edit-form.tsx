import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import {
  withQuery,
  withMutation,
} from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';

import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';
import {
  DateField,
  InputTextField,
  InputNumberField,
  RadioGroupField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';

import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { AuditInfo } from '/imports/ui/modules/common';

const FormStyle = {
  width: '800px',
};

const AntForm = Form as any;
const TextField = InputTextField as any;
const AdjustmentDateField = DateField as any;
const NumberField = InputNumberField as any;
const RadioField = RadioGroupField as any;
const KarkunSelectField = KarkunField as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const AuditInfoComponent = AuditInfo as any;

interface PhysicalStore {
  name: string;
}

interface HistoryLike {
  goBack(): void;
}

interface MatchLike {
  params: {
    formId: string;
  };
}

interface MutateFunction {
  (options: { variables: Record<string, unknown> }): Promise<unknown>;
}

interface StockAdjustment {
  _id: string;
  physicalStoreId: string;
  adjustmentDate: string;
  quantity: number;
  isInflow: boolean;
  adjustmentReason?: string;
  refStockItem: {
    formattedName: string;
  };
  refAdjustedBy: {
    _id: string;
    name: string;
  };
}

interface EditFormProps {
  history: HistoryLike;
  match: MatchLike;
  physicalStoreId?: string;
  physicalStore?: PhysicalStore;
  formDataLoading?: boolean;
  stockAdjustmentById?: StockAdjustment;
  updateStockAdjustment: MutateFunction;
}

interface EditFormState {
  isFieldsTouched: boolean;
}

interface StockAdjustmentFormValues {
  adjustmentDate: string;
  adjustedBy: { _id: string };
  quantity: number;
  adjustment: 'inflow' | 'outflow';
  adjustmentReason?: string;
}

class EditForm extends Component<EditFormProps, EditFormState> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    formDataLoading: PropTypes.bool,
    stockAdjustmentById: PropTypes.object,
    updateStockAdjustment: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  };

  handleFinish = ({
    adjustmentDate,
    adjustedBy,
    quantity,
    adjustment,
    adjustmentReason,
  }: StockAdjustmentFormValues) => {
    const {
      history,
      updateStockAdjustment,
      stockAdjustmentById,
    } = this.props;
    if (!stockAdjustmentById) return;
    const { _id, physicalStoreId } = stockAdjustmentById;

    const isInflow = adjustment === 'inflow';
    updateStockAdjustment({
      variables: {
        _id,
        physicalStoreId,
        adjustmentDate,
        adjustedBy: adjustedBy._id,
        quantity,
        isInflow,
        adjustmentReason,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { formDataLoading, stockAdjustmentById, physicalStoreId } =
      this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (formDataLoading || !stockAdjustmentById) return null;

    return (
      <>
        <AntForm
          layout="horizontal"
          style={FormStyle}
          onFinish={this.handleFinish}
          onFieldsChange={this.handleFieldsChange}
        >
          <TextField
            fieldName="stockItemId"
            fieldLabel="Stock Item Name"
            initialValue={stockAdjustmentById.refStockItem.formattedName}
          />

          <RadioField
            fieldName="adjustment"
            fieldLabel="Adjustment"
            initialValue={stockAdjustmentById.isInflow ? 'inflow' : 'outflow'}
            options={[
              { label: 'Increase by', value: 'inflow' },
              { label: 'Decrease by', value: 'outflow' },
            ]}
          />

          <NumberField
            fieldName="quantity"
            fieldLabel="Quantity"
            initialValue={stockAdjustmentById.quantity}
            required
            requiredMessage="Please input a value for adjustment quantity."
            minValue={0}
          />

          <AdjustmentDateField
            fieldName="adjustmentDate"
            fieldLabel="Adjustment Date"
            initialValue={dayjs(Number(stockAdjustmentById.adjustmentDate))}
            required
            requiredMessage="Please input an adjustment date."
          />
          <KarkunSelectField
            fieldName="adjustedBy"
            fieldLabel="Adjusted By"
            placeholder="Adjusted By"
            required
            requiredMessage="Please select a name for adjusted By."
            initialValue={stockAdjustmentById.refAdjustedBy}
            predefinedFilterStoreId={physicalStoreId}
            predefinedFilterName={
              PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY
            }
          />

          <TextAreaField
            fieldName="adjustmentReason"
            fieldLabel="Adjustment Reason"
            initialValue={stockAdjustmentById.adjustmentReason}
            required={false}
          />

          <SaveCancelButtons
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </AntForm>
        <AuditInfoComponent record={stockAdjustmentById} />
      </>
    );
  }
}

const formQuery = gql`
  query stockAdjustmentById($_id: String!, $physicalStoreId: String!) {
    stockAdjustmentById(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      physicalStoreId
      stockItemId
      adjustmentDate
      adjustedBy
      quantity
      isInflow
      adjustmentReason
      createdAt
      createdBy
      updatedAt
      updatedBy
      refStockItem {
        _id
        name
        formattedName
      }
      refAdjustedBy {
        _id
        name
      }
    }
  }
`;

const formMutation = gql`
  mutation updateStockAdjustment(
    $_id: String!
    $physicalStoreId: String!
    $adjustmentDate: String!
    $adjustedBy: String!
    $quantity: Float!
    $isInflow: Boolean!
    $adjustmentReason: String
  ) {
    updateStockAdjustment(
      _id: $_id
      physicalStoreId: $physicalStoreId
      adjustmentDate: $adjustmentDate
      adjustedBy: $adjustedBy
      quantity: $quantity
      isInflow: $isInflow
      adjustmentReason: $adjustmentReason
    ) {
      _id
      physicalStoreId
      stockItemId
      adjustmentDate
      adjustedBy
      quantity
      isInflow
      adjustmentReason
      createdAt
      createdBy
      updatedAt
      updatedBy
      refStockItem {
        _id
        name
        formattedName
      }
      refAdjustedBy {
        _id
        name
      }
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  withMutation(formMutation, {
    name: 'updateStockAdjustment',
    options: {
      refetchQueries: [
        'pagedStockAdjustment',
        'stockAdjustmentByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  withQuery(formQuery, {
    props: ({ data }: { data: Record<string, any> }) => ({
      formDataLoading: data.loading,
      ...data,
    }),
    options: ({
      match,
      physicalStoreId,
    }: {
      match?: MatchLike;
      physicalStoreId?: string;
    }) => {
      if (!match) return { variables: { _id: '', physicalStoreId } };
      const { formId } = match.params;
      return { variables: { _id: formId, physicalStoreId } };
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }: { physicalStore?: PhysicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Adjustments, Edit`;
    }
    return `Inventory, Stock Adjustments, Edit`;
  })
)(EditForm as any);
