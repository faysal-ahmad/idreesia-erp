import React, { Component } from "react";
import PropTypes from "prop-types";
import { Divider, Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { ItemsList } from "../common/items-list";
import { WithDynamicBreadcrumbs } from "/imports/ui/composers";
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithVendorsByPhysicalStore,
} from "/imports/ui/modules/inventory/common/composers";
import {
  DateField,
  SelectField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from "/imports/ui/modules/helpers/fields";

import { KarkunField } from "/imports/ui/modules/hr/karkuns/field";
import { PredefinedFilterNames } from "meteor/idreesia-common/constants/hr";

const FormStyle = {
  width: "800px",
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    vendorsLoading: PropTypes.bool,
    vendorsByPhysicalStoreId: PropTypes.array,
    createPurchaseForm: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, physicalStoreId, createPurchaseForm } = this.props;
    form.validateFields(
      (
        err,
        { purchaseDate, vendorId, receivedBy, purchasedBy, items, notes }
      ) => {
        if (err) return;

        createPurchaseForm({
          variables: {
            purchaseDate,
            vendorId,
            receivedBy: receivedBy._id,
            purchasedBy: purchasedBy._id,
            physicalStoreId,
            items,
            notes,
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

  getItemsField() {
    const { form, physicalStoreId } = this.props;
    const { getFieldDecorator } = form;

    const rules = [
      {
        required: true,
        message: "Please add some items.",
      },
    ];
    return getFieldDecorator("items", { rules })(
      <ItemsList
        refForm={form}
        defaultLabel="Purchased"
        inflowLabel="Purchased"
        outflowLabel="Returned"
        showPrice
        physicalStoreId={physicalStoreId}
      />
    );
  }

  render() {
    const { vendorsLoading, vendorsByPhysicalStoreId } = this.props;
    if (vendorsLoading) return null;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={this.handleSubmit}>
        <DateField
          fieldName="purchaseDate"
          fieldLabel="Purchase Date"
          required
          requiredMessage="Please input a purchase date."
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          data={vendorsByPhysicalStoreId}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="vendorId"
          fieldLabel="Vendor"
          getFieldDecorator={getFieldDecorator}
        />
        <KarkunField
          required
          requiredMessage="Please select a name for Received By / Returned By."
          fieldName="receivedBy"
          fieldLabel="Received By / Returned By"
          placeholder="Received By / Returned By"
          getFieldDecorator={getFieldDecorator}
          predefinedFilterName={
            PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY
          }
        />
        <KarkunField
          required
          requiredMessage="Please select a name for Purchased By / Returned To."
          fieldName="purchasedBy"
          fieldLabel="Purchased By / Returned To"
          placeholder="Purchased By / Returned To"
          getFieldDecorator={getFieldDecorator}
          predefinedFilterName={
            PredefinedFilterNames.PURCHASE_FORMS_PURCHASED_BY_RETURNED_TO
          }
        />

        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <Divider orientation="left">Purchased / Returned Items</Divider>
        <Form.Item {...formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createPurchaseForm(
    $purchaseDate: String!
    $receivedBy: String!
    $purchasedBy: String!
    $physicalStoreId: String!
    $vendorId: String
    $items: [ItemWithQuantityAndPriceInput]
    $notes: String
  ) {
    createPurchaseForm(
      purchaseDate: $purchaseDate
      receivedBy: $receivedBy
      purchasedBy: $purchasedBy
      physicalStoreId: $physicalStoreId
      vendorId: $vendorId
      items: $items
      notes: $notes
    ) {
      _id
      purchaseDate
      physicalStoreId
      vendorId
      items {
        stockItemId
        quantity
        isInflow
        price
      }
      refReceivedBy {
        _id
        name
      }
      refPurchasedBy {
        _id
        name
      }
      notes
    }
  }
`;

export default compose(
  Form.create(),
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithVendorsByPhysicalStore(),
  graphql(formMutation, {
    name: "createPurchaseForm",
    options: {
      refetchQueries: [
        "pagedPurchaseForms",
        "purchaseFormsByStockItem",
        "pagedStockItems",
        "vendorsByPhysicalStoreId",
      ],
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Purchase Forms, New`;
    }
    return `Inventory, Purchase Forms, New`;
  })
)(NewForm);
