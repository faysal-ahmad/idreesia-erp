import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
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

class EditForm extends Component {
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
  }

  handleFinish = ({ adjustmentDate, adjustedBy, quantity, adjustment, adjustmentReason }) => {
    const {
      history,
      updateStockAdjustment,
      stockAdjustmentById: { _id, physicalStoreId },
    } = this.props;

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
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { formDataLoading, stockAdjustmentById, physicalStoreId } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (formDataLoading) return null;

    return (
      <>
        <Form layout="horizontal" style={FormStyle} onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="stockItemId"
            fieldLabel="Stock Item Name"
            initialValue={stockAdjustmentById.refStockItem.formattedName}
          />

          <RadioGroupField
            fieldName="adjustment"
            fieldLabel="Adjustment"
            initialValue={stockAdjustmentById.isInflow ? 'inflow' : 'outflow'}
            options={[
              { label: 'Increase by', value: 'inflow' },
              { label: 'Decrease by', value: 'outflow' },
            ]}
          />

          <InputNumberField
            fieldName="quantity"
            fieldLabel="Quantity"
            initialValue={stockAdjustmentById.quantity}
            required
            requiredMessage="Please input a value for adjustment quantity."
            minValue={0}
          />

          <DateField
            fieldName="adjustmentDate"
            fieldLabel="Adjustment Date"
            initialValue={dayjs(Number(stockAdjustmentById.adjustmentDate))}
            required
            requiredMessage="Please input an adjustment date."
          />
          <KarkunField
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

          <InputTextAreaField
            fieldName="adjustmentReason"
            fieldLabel="Adjustment Reason"
            initialValue={stockAdjustmentById.adjustmentReason}
            required={false}
          />

          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={stockAdjustmentById} />
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
  graphql(formMutation, {
    name: 'updateStockAdjustment',
    options: {
      refetchQueries: [
        'pagedStockAdjustment',
        'stockAdjustmentByStockItem',
        'pagedStockItems',
      ],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match, physicalStoreId }) => {
      const { formId } = match.params;
      return { variables: { _id: formId, physicalStoreId } };
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Adjustments, Edit`;
    }
    return `Inventory, Stock Adjustments, Edit`;
  })
)(EditForm);
