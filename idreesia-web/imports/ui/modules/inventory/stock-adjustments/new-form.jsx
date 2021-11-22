import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
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

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    loading: PropTypes.bool,
    createStockAdjustment: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      physicalStoreId,
      createStockAdjustment,
    } = this.props;
    form.validateFields(
      (
        err,
        {
          stockItem,
          adjustmentDate,
          adjustedBy,
          quantity,
          adjustment,
          adjustmentReason,
        }
      ) => {
        if (err) return;

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
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { form, physicalStoreId } = this.props;
    const { isFieldsTouched } = form;

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={this.handleSubmit}>
        <StockItemField
          physicalStoreId={physicalStoreId}
          fieldName="stockItem"
          fieldLabel="Stock Item Name"
          required
          requiredMessage="Please select a stock item."
        />

        <RadioGroupField
          fieldName="adjustment"
          fieldLabel="Adjustment"
          required
          options={[
            { label: 'Increase by', value: 'inflow' },
            { label: 'Decrease by', value: 'outflow' },
          ]}
        />

        <InputNumberField
          fieldName="quantity"
          fieldLabel="Quantity"
          required
          requiredMessage="Please input a value for adjustment quantity."
          minValue={0}
        />

        <DateField
          fieldName="adjustmentDate"
          fieldLabel="Adjustment Date"
          required
          requiredMessage="Please input an adjustment date."
        />
        <KarkunField
          fieldName="adjustedBy"
          fieldLabel="Adjusted By"
          placeholder="Adjusted By"
          required
          requiredMessage="Please select a name for adjusted By."
          predefinedFilterName={
            PredefinedFilterNames.STOCK_ADJUSTMENTS_ADJUSTED_BY
          }
        />

        <InputTextAreaField
          fieldName="adjustmentReason"
          fieldLabel="Adjustment Reason"
          required={false}
        />

        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
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
  graphql(formMutation, {
    name: 'createStockAdjustment',
    options: {
      refetchQueries: [
        'pagedStockAdjustment',
        'stockAdjustmentByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Adjustments, New`;
    }
    return `Inventory, Stock Adjustments, New`;
  })
)(NewForm);
