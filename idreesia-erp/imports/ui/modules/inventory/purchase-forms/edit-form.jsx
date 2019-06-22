import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import moment from "moment";
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

class EditForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,

    formDataLoading: PropTypes.bool,
    purchaseFormById: PropTypes.object,
    updatePurchaseForm: PropTypes.func,
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
            receivedBy: receivedBy._id,
            purchasedBy: purchasedBy._id,
            physicalStoreId,
            items: updatedItems,
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
    const { form, purchaseFormById, physicalStoreId } = this.props;
    const { getFieldDecorator } = form;

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
        refForm={form}
        defaultLabel="Purchased"
        inflowLabel="Purchased"
        outflowLabel="Returned"
        physicalStoreId={physicalStoreId}
      />
    );
  }

  render() {
    const { formDataLoading, purchaseFormById } = this.props;
    if (formDataLoading) return null;

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={this.handleSubmit}>
        <DateField
          fieldName="purchaseDate"
          fieldLabel="Purchase Date"
          initialValue={moment(Number(purchaseFormById.purchaseDate))}
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
          initialValue={purchaseFormById.refReceivedBy}
          getFieldDecorator={getFieldDecorator}
        />
        <KarkunField
          required
          requiredMessage="Please select a name for Purchased By / Returned To."
          fieldName="purchasedBy"
          fieldLabel="Purchased By / Returned To"
          placeholder="Purchased By / Returned To"
          initialValue={purchaseFormById.refPurchasedBy}
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

const formQuery = gql`
  query purchaseFormById($_id: String!) {
    purchaseFormById(_id: $_id) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      physicalStoreId
      approvedOn
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
