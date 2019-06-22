import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { ItemsList } from "../common/items-list";
import { WithBreadcrumbs } from "/imports/ui/composers";
import { WithPhysicalStoreId } from "/imports/ui/modules/inventory/common/composers";
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextAreaField,
} from "/imports/ui/modules/helpers/fields";

import { KarkunField } from "/imports/ui/modules/hr/karkuns/field";

const FormStyle = {
  width: "800px",
};

const formItemExtendedLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    physicalStoreId: PropTypes.string,
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
      (err, { purchaseDate, receivedBy, purchasedBy, items, notes }) => {
        if (err) return;

        createPurchaseForm({
          variables: {
            purchaseDate,
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
        physicalStoreId={physicalStoreId}
      />
    );
  }

  render() {
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
        <KarkunField
          required
          requiredMessage="Please select a name for Received By / Returned By."
          fieldName="receivedBy"
          fieldLabel="Received By / Returned By"
          placeholder="Received By / Returned By"
          getFieldDecorator={getFieldDecorator}
        />
        <KarkunField
          required
          requiredMessage="Please select a name for Purchased By / Returned To."
          fieldName="purchasedBy"
          fieldLabel="Purchased By / Returned To"
          placeholder="Purchased By / Returned To"
          getFieldDecorator={getFieldDecorator}
        />

        <Form.Item label="Purchased Items" {...formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>

        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

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
    $items: [ItemWithQuantityAndPriceInput]
    $notes: String
  ) {
    createPurchaseForm(
      purchaseDate: $purchaseDate
      receivedBy: $receivedBy
      purchasedBy: $purchasedBy
      physicalStoreId: $physicalStoreId
      items: $items
      notes: $notes
    ) {
      _id
      purchaseDate
      physicalStoreId
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
  graphql(formMutation, {
    name: "createPurchaseForm",
    options: {
      refetchQueries: [
        "pagedPurchaseForms",
        "purchaseFormsByStockItem",
        "pagedStockItems",
      ],
    },
  }),
  WithBreadcrumbs(["Inventory", "Forms", "Purchase Forms", "New"])
)(NewForm);
