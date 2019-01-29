import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  WithKarkuns,
  WithPhysicalStoreId,
  WithStockItemsByPhysicalStore,
} from "/imports/ui/modules/inventory/common/composers";
import {
  AutoCompleteField,
  DateField,
  InputNumberField,
  RadioGroupField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from "/imports/ui/modules/helpers/fields";

const FormStyle = {
  width: "800px",
};

const OptionStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  width: "100%",
};

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    stockItemsLoading: PropTypes.bool,
    stockItemsByPhysicalStoreId: PropTypes.array,
    karkunsListLoading: PropTypes.bool,
    allKarkuns: PropTypes.array,

    loading: PropTypes.bool,
    physicalStoreId: PropTypes.string,
    createStockAdjustment: PropTypes.func,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.stockAdjustmentsPath(physicalStoreId));
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
          stockItemId,
          adjustmentDate,
          adjustedBy,
          quantity,
          adjustment,
          adjustmentReason,
        }
      ) => {
        if (err) return;

        const isInflow = adjustment === "inflow";
        createStockAdjustment({
          variables: {
            physicalStoreId,
            stockItemId,
            adjustmentDate,
            adjustedBy,
            quantity,
            isInflow,
            adjustmentReason,
          },
        })
          .then(() => {
            history.push(paths.stockAdjustmentsPath(physicalStoreId));
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const {
      stockItemsLoading,
      karkunsListLoading,
      allKarkuns,
      stockItemsByPhysicalStoreId,
    } = this.props;
    if (stockItemsLoading || karkunsListLoading) return null;

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={this.handleSubmit}>
        <AutoCompleteField
          data={stockItemsByPhysicalStoreId}
          getDataValue={({ _id }) => _id}
          getDataText={({ itemTypeFormattedName }) => itemTypeFormattedName}
          fieldName="stockItemId"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the stock item."
          getFieldDecorator={getFieldDecorator}
          optionRenderer={(text, dataObj) => (
            <div key={dataObj.stockItemId} style={OptionStyle}>
              {dataObj.itemTypeFormattedName}
              <span>{dataObj.currentStockLevel} Available</span>
            </div>
          )}
        />

        <RadioGroupField
          fieldName="adjustment"
          fieldLabel="Adjustment"
          options={[
            { label: "Increase by", value: "inflow" },
            { label: "Decrease by", value: "outflow" },
          ]}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="quantity"
          fieldLabel="Quantity"
          required
          requiredMessage="Please input a value for adjustment quantity."
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="adjustmentDate"
          fieldLabel="Adjustment Date"
          required
          requiredMessage="Please input an adjustment date."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="adjustedBy"
          fieldLabel="Adjusted By"
          placeholder="Adjusted By"
          required
          requiredMessage="Please input a name in adjusted by."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="adjustmentReason"
          fieldLabel="Adjustment Reason"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
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

export default compose(
  Form.create(),
  WithKarkuns(),
  WithPhysicalStoreId(),
  WithStockItemsByPhysicalStore(),
  graphql(formMutation, {
    name: "createStockAdjustment",
    options: {
      refetchQueries: [
        "pagedStockAdjustment",
        "stockAdjustmentByStockItem",
        "pagedStockItems",
      ],
    },
  }),
  WithBreadcrumbs(["Inventory", "Forms", "Stock Adjustments", "New"])
)(NewForm);
