import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  InputTextField,
  InputNumberField,
  SelectField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";
import {
  WithPhysicalStoreId,
  WithItemCategories,
} from "/imports/ui/modules/inventory/common/composers";

import allUnitOfMeasurements from "./all-unit-of-measurements";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,
    form: PropTypes.object,

    itemCategoriesListLoading: PropTypes.bool,
    allItemCategories: PropTypes.array,
    physicalStoreId: PropTypes.string,
    createStockItem: PropTypes.func,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.stockItemsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, physicalStoreId, createStockItem } = this.props;
    form.validateFields(
      (
        err,
        {
          name,
          company,
          details,
          categoryId,
          unitOfMeasurement,
          minStockLevel,
          currentStockLevel,
        }
      ) => {
        if (err) return;

        createStockItem({
          variables: {
            name,
            company,
            details,
            categoryId,
            unitOfMeasurement,
            physicalStoreId,
            minStockLevel,
            currentStockLevel,
          },
        })
          .then(() => {
            history.push(paths.stockItemsPath(physicalStoreId));
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { itemCategoriesListLoading, allItemCategories } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (itemCategoriesListLoading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the stock item."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="company"
          fieldLabel="Company"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="details"
          fieldLabel="Details"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          data={allItemCategories}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="categoryId"
          fieldLabel="Category"
          required
          requiredMessage="Please select an item category."
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          data={allUnitOfMeasurements}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="unitOfMeasurement"
          fieldLabel="Measurement Unit"
          required
          requiredMessage="Please select a unit of measurement."
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          required
          requiredMessage="Please set the current stock level."
          fieldName="currentStockLevel"
          fieldLabel="Current Stock Level"
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="minStockLevel"
          fieldLabel="Min Stock Level"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createStockItem(
    $name: String!
    $company: String
    $details: String
    $unitOfMeasurement: String!
    $categoryId: String!
    $physicalStoreId: String!
    $minStockLevel: Float
    $currentStockLevel: Float
  ) {
    createStockItem(
      name: $name
      company: $company
      details: $details
      unitOfMeasurement: $unitOfMeasurement
      categoryId: $categoryId
      physicalStoreId: $physicalStoreId
      minStockLevel: $minStockLevel
      currentStockLevel: $currentStockLevel
    ) {
      _id
      name
      company
      details
      unitOfMeasurement
      categoryId
      physicalStoreId
      minStockLevel
      currentStockLevel
    }
  }
`;

export default compose(
  Form.create({ name: "newStockItemForm" }),
  WithPhysicalStoreId(),
  WithItemCategories(),
  graphql(formMutation, {
    name: "createStockItem",
    options: {
      refetchQueries: ["pagedStockItems", "stockItemsByPhysicalStoreId"],
    },
  }),
  WithBreadcrumbs(["Inventory", "Stock Items", "New"])
)(NewForm);
