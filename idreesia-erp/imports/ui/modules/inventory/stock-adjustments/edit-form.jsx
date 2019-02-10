import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import moment from "moment";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import { WithPhysicalStoreId } from "/imports/ui/modules/inventory/common/composers";
import {
  DateField,
  InputTextField,
  InputNumberField,
  RadioGroupField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from "/imports/ui/modules/helpers/fields";

import { KarkunField } from "/imports/ui/modules/hr/karkuns/field";

const FormStyle = {
  width: "800px",
};

class EditForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    stockAdjustmentById: PropTypes.object,
    physicalStoreId: PropTypes.string,
    updateStockAdjustment: PropTypes.func,
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
      updateStockAdjustment,
      stockAdjustmentById: { _id },
    } = this.props;
    form.validateFields(
      (
        err,
        { adjustmentDate, adjustedBy, quantity, adjustment, adjustmentReason }
      ) => {
        if (err) return;

        const isInflow = adjustment === "inflow";
        updateStockAdjustment({
          variables: {
            _id,
            adjustmentDate,
            adjustedBy: adjustedBy._id,
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
    const { formDataLoading, stockAdjustmentById } = this.props;
    if (formDataLoading) return null;

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="stockItemId"
          fieldLabel="Name"
          initialValue={stockAdjustmentById.refStockItem.itemTypeFormattedName}
          getFieldDecorator={getFieldDecorator}
        />

        <RadioGroupField
          fieldName="adjustment"
          fieldLabel="Adjustment"
          initialValue={stockAdjustmentById.isInflow ? "inflow" : "outflow"}
          options={[
            { label: "Increase by", value: "inflow" },
            { label: "Decrease by", value: "outflow" },
          ]}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="quantity"
          fieldLabel="Quantity"
          initialValue={stockAdjustmentById.quantity}
          required
          requiredMessage="Please input a value for adjustment quantity."
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="adjustmentDate"
          fieldLabel="Adjustment Date"
          initialValue={moment(new Date(stockAdjustmentById.adjustmentDate))}
          required
          requiredMessage="Please input an adjustment date."
          getFieldDecorator={getFieldDecorator}
        />
        <KarkunField
          fieldName="adjustedBy"
          fieldLabel="Adjusted By"
          placeholder="Adjusted By"
          required
          requiredMessage="Please select a name for adjusted By."
          initialValue={stockAdjustmentById.refAdjustedBy}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="adjustmentReason"
          fieldLabel="Adjustment Reason"
          initialValue={stockAdjustmentById.adjustmentReason}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query stockAdjustmentById($_id: String!) {
    stockAdjustmentById(_id: $_id) {
      _id
      physicalStoreId
      stockItemId
      adjustmentDate
      adjustedBy
      quantity
      isInflow
      adjustmentReason
      refStockItem {
        _id
        itemTypeName
        itemTypeFormattedName
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
    $adjustmentDate: String!
    $adjustedBy: String!
    $quantity: Float!
    $isInflow: Boolean!
    $adjustmentReason: String
  ) {
    updateStockAdjustment(
      _id: $_id
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
      refStockItem {
        _id
        itemTypeName
        itemTypeFormattedName
      }
      refAdjustedBy {
        _id
        name
      }
    }
  }
`;

export default compose(
  Form.create(),
  WithPhysicalStoreId(),
  graphql(formMutation, {
    name: "updateStockAdjustment",
    options: {
      refetchQueries: [
        "pagedStockAdjustment",
        "stockAdjustmentByStockItem",
        "pagedStockItems",
      ],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  }),
  WithBreadcrumbs(["Inventory", "Forms", "Stock Adjustments", "Edit"])
)(EditForm);
