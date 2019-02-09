import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  InputNumberField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";
import { WithPhysicalStoreId } from "/imports/ui/modules/inventory/common/composers";

import { ItemTypeField } from "/imports/ui/modules/inventory/item-types/field";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,
    form: PropTypes.object,

    unStockedItemTypesLoading: PropTypes.bool,
    unStockedItemTypesByPhysicalStoreId: PropTypes.array,

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
        { itemType, minStockLevel, currentStockLevel, totalStockLevel }
      ) => {
        if (err) return;

        createStockItem({
          variables: {
            itemTypeId: itemType._id,
            physicalStoreId,
            minStockLevel,
            currentStockLevel,
            totalStockLevel,
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
    const { physicalStoreId } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <ItemTypeField
          required
          requiredMessage="Please select and item type."
          fieldName="itemType"
          fieldLabel="Item Type"
          getFieldDecorator={getFieldDecorator}
          physicalStoreId={physicalStoreId}
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

const unStockedItemTypesListQuery = gql`
  query unStockedItemTypesByPhysicalStoreId($physicalStoreId: String!) {
    unStockedItemTypesByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
      _id
      formattedName
      itemCategoryId
    }
  }
`;

const formMutation = gql`
  mutation createStockItem(
    $itemTypeId: String!
    $physicalStoreId: String!
    $minStockLevel: Float
    $currentStockLevel: Float
  ) {
    createStockItem(
      itemTypeId: $itemTypeId
      physicalStoreId: $physicalStoreId
      minStockLevel: $minStockLevel
      currentStockLevel: $currentStockLevel
    ) {
      _id
      itemTypeName
      itemCategoryName
      minStockLevel
      currentStockLevel
    }
  }
`;

export default compose(
  Form.create({ name: "newStockItemForm" }),
  WithPhysicalStoreId(),
  graphql(unStockedItemTypesListQuery, {
    props: ({ data }) => ({ unStockedItemTypesLoading: data.loading, ...data }),
    options: ({ physicalStoreId }) => ({
      variables: { physicalStoreId },
    }),
  }),
  graphql(formMutation, {
    name: "createStockItem",
    options: {
      refetchQueries: [
        "pagedStockItems",
        "stockItemsByPhysicalStoreId",
        "unStockedItemTypesByPhysicalStoreId",
      ],
    },
  }),
  WithBreadcrumbs(["Inventory", "Stock Items", "New"])
)(NewForm);
