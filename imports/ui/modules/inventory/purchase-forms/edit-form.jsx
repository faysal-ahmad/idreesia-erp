import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import moment from "moment";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { ItemsList } from "../common/items-list";
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
  FormButtonsSaveCancel,
  InputTextAreaField,
} from "/imports/ui/modules/helpers/fields";

const FormStyle = {
  width: "800px",
};

const formItemExtendedLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

class EditForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,

    stockItemsLoading: PropTypes.bool,
    stockItemsByPhysicalStoreId: PropTypes.array,
    karkunsListLoading: PropTypes.bool,
    allKarkuns: PropTypes.array,

    formDataLoading: PropTypes.bool,
    purchaseFormById: PropTypes.object,
    updatePurchaseForm: PropTypes.func,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.purchaseFormsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      physicalStoreId,
      updatePurchaseForm,
      purchaseFormById: { _id },
    } = this.props;
    form.validateFields(
      (err, { purchaseDate, receivedBy, purchasedBy, items, notes }) => {
        if (err) return;

        const updatedItems = items.map(
          ({ stockItemId, quantity, isInflow }) => ({
            stockItemId,
            quantity,
            isInflow,
          })
        );
        updatePurchaseForm({
          variables: {
            _id,
            purchaseDate,
            receivedBy,
            purchasedBy,
            physicalStoreId,
            items: updatedItems,
            notes,
          },
        })
          .then(() => {
            history.push(paths.purchaseFormsPath(physicalStoreId));
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  getItemsField() {
    const {
      purchaseFormById,
      physicalStoreId,
      stockItemsByPhysicalStoreId,
    } = this.props;
    const { getFieldDecorator } = this.props.form;

    const rules = [
      {
        required: true,
        message: "Please add some items.",
      },
    ];
    return getFieldDecorator("items", {
      rules,
      initialValue: purchaseFormById.items,
    })(
      <ItemsList
        inflowLabel="Purchased"
        outflowLabel="Returned"
        physicalStoreId={physicalStoreId}
        stockItemsByPhysicalStore={stockItemsByPhysicalStoreId}
      />
    );
  }

  render() {
    const {
      karkunsListLoading,
      stockItemsLoading,
      formDataLoading,
      purchaseFormById,
      allKarkuns,
    } = this.props;
    if (karkunsListLoading || stockItemsLoading || formDataLoading) {
      return null;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={this.handleSubmit}>
        <DateField
          fieldName="purchaseDate"
          fieldLabel="Purchase Date"
          initialValue={moment(new Date(purchaseFormById.purchaseDate))}
          required
          requiredMessage="Please input a purchase date."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="receivedBy"
          fieldLabel="Received By"
          initialValue={purchaseFormById.receivedBy}
          required
          requiredMessage="Please input a name in received by."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="purchasedBy"
          fieldLabel="Purchaseed By"
          initialValue={purchaseFormById.purchasedBy}
          required
          requiredMessage="Please input a name in purchased by."
          getFieldDecorator={getFieldDecorator}
        />

        <Form.Item label="Purchaseed Items" {...formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>

        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
          initialValue={purchaseFormById.notes}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation updatePurchaseForm(
    $_id: String!
    $purchaseDate: String!
    $receivedBy: String!
    $purchasedBy: String!
    $physicalStoreId: String!
    $items: [ItemWithQuantityAndPriceInput]
    $notes: String
  ) {
    updatePurchaseForm(
      _id: $_id
      purchaseDate: $purchaseDate
      receivedBy: $receivedBy
      purchasedBy: $purchasedBy
      physicalStoreId: $physicalStoreId
      items: $items
      notes: $notes
    ) {
      _id
      purchaseDate
      receivedByName
      purchasedByName
      physicalStoreId
      items {
        stockItemId
        quantity
        isInflow
        price
      }
      notes
    }
  }
`;

const formQuery = gql`
  query purchaseFormById($_id: String!) {
    purchaseFormById(_id: $_id) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      receivedByName
      purchasedByName
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
        price
        itemTypeName
      }
      notes
    }
  }
`;

export default compose(
  Form.create(),
  WithKarkuns(),
  WithPhysicalStoreId(),
  WithStockItemsByPhysicalStore(),
  graphql(formMutation, {
    name: "updatePurchaseForm",
    options: {
      refetchQueries: [
        "pagedPurchaseForms",
        "purchaseFormsByStockItem",
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
  WithBreadcrumbs(["Inventory", "Forms", "Purchase Forms", "Edit"])
)(EditForm);
