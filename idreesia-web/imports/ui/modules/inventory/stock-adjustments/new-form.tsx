import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withMutation } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
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
  InputNumberField,
  RadioGroupField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';

import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { StockItemField } from '/imports/ui/modules/inventory/stock-items/field';

const FormStyle = {
  width: '800px',
};

const AntForm = Form as any;
const StockItemSelectField = StockItemField as any;
const KarkunSelectField = KarkunField as any;
const AdjustmentDateField = DateField as any;
const NumberField = InputNumberField as any;
const RadioField = RadioGroupField as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;

interface PhysicalStore {
  name: string;
}

interface HistoryLike {
  goBack(): void;
}

interface MutateFunction {
  (options: { variables: Record<string, unknown> }): Promise<unknown>;
}

interface NewFormProps {
  history: HistoryLike;
  physicalStoreId?: string;
  physicalStore?: PhysicalStore;
  loading?: boolean;
  createStockAdjustment: MutateFunction;
}

interface NewFormState {
  isFieldsTouched: boolean;
}

interface StockAdjustmentFormValues {
  stockItem: { _id: string };
  adjustmentDate: string;
  adjustedBy: { _id: string };
  quantity: number;
  adjustment: 'inflow' | 'outflow';
  adjustmentReason?: string;
}

class NewForm extends Component<NewFormProps, NewFormState> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    loading: PropTypes.bool,
    createStockAdjustment: PropTypes.func,
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
    stockItem,
    adjustmentDate,
    adjustedBy,
    quantity,
    adjustment,
    adjustmentReason,
  }: StockAdjustmentFormValues) => {
    const { history, physicalStoreId, createStockAdjustment } = this.props;
    const isInflow = adjustment === 'inflow';
    createStockAdjustment({
      variables: {
        physicalStoreId,
        stockItemId: stockItem._id,
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
    const { physicalStoreId } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <AntForm
        layout="horizontal"
        style={FormStyle}
        onFinish={this.handleFinish}
        onFieldsChange={this.handleFieldsChange}
      >
        <StockItemSelectField
          physicalStoreId={physicalStoreId}
          fieldName="stockItem"
          fieldLabel="Stock Item Name"
          required
          requiredMessage="Please select a stock item."
        />

        <RadioField
          fieldName="adjustment"
          fieldLabel="Adjustment"
          required
          options={[
            { label: 'Increase by', value: 'inflow' },
            { label: 'Decrease by', value: 'outflow' },
          ]}
        />

        <NumberField
          fieldName="quantity"
          fieldLabel="Quantity"
          required
          requiredMessage="Please input a value for adjustment quantity."
          minValue={0}
        />

        <AdjustmentDateField
          fieldName="adjustmentDate"
          fieldLabel="Adjustment Date"
          required
          requiredMessage="Please input an adjustment date."
        />
        <KarkunSelectField
          fieldName="adjustedBy"
          fieldLabel="Adjusted By"
          placeholder="Adjusted By"
          required
          requiredMessage="Please select a name for adjusted By."
          predefinedFilterStoreId={physicalStoreId}
          predefinedFilterName={
            PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY
          }
        />

        <TextAreaField
          fieldName="adjustmentReason"
          fieldLabel="Adjustment Reason"
          required={false}
        />

        <SaveCancelButtons
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
    );
  }
}

const formMutation = gql`
  mutation createStockAdjustment(
    $physicalStoreId: String!
    $stockItemId: String!
    $adjustmentDate: String!
    $adjustedBy: String!
    $quantity: Float!
    $isInflow: Boolean!
    $adjustmentReason: String
  ) {
    createStockAdjustment(
      physicalStoreId: $physicalStoreId
      stockItemId: $stockItemId
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
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  withMutation(formMutation, {
    name: 'createStockAdjustment',
    options: {
      refetchQueries: [
        'pagedStockAdjustment',
        'stockAdjustmentByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }: { physicalStore?: PhysicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Adjustments, New`;
    }
    return `Inventory, Stock Adjustments, New`;
  })
)(NewForm as any);
