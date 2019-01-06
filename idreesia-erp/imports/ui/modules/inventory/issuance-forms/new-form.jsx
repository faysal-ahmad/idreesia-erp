import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
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
    createIssuanceForm: PropTypes.func,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, physicalStoreId, createIssuanceForm } = this.props;
    form.validateFields(
      (err, { issueDate, issuedBy, issuedTo, items, notes }) => {
        if (err) return;

        createIssuanceForm({
          variables: {
            issueDate,
            issuedBy,
            issuedTo,
            physicalStoreId,
            items,
            notes,
          },
        })
          .then(() => {
            history.push(paths.issuanceFormsPath(physicalStoreId));
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  getItemsField() {
    const { physicalStoreId, stockItemsByPhysicalStoreId } = this.props;
    const { getFieldDecorator } = this.props.form;

    const rules = [
      {
        required: true,
        message: "Please add some items.",
      },
    ];
    return getFieldDecorator("items", { rules })(
      <ItemsList
        inflowLabel="Returned"
        outflowLabel="Issued"
        physicalStoreId={physicalStoreId}
        stockItemsByPhysicalStore={stockItemsByPhysicalStoreId}
      />
    );
  }

  render() {
    const { stockItemsLoading, karkunsListLoading, allKarkuns } = this.props;
    if (stockItemsLoading || karkunsListLoading) return null;

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={this.handleSubmit}>
        <DateField
          fieldName="issueDate"
          fieldLabel="Issue Date"
          required
          requiredMessage="Please input an issue date."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="issuedBy"
          fieldLabel="Issued By"
          placeholder="Issued By"
          required
          requiredMessage="Please input a name in issued by."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="issuedTo"
          fieldLabel="Issued To"
          placeholder="Issued To"
          required
          requiredMessage="Please input a name in issued to."
          getFieldDecorator={getFieldDecorator}
        />

        <Form.Item label="Issued Items" {...formItemExtendedLayout}>
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
  mutation createIssuanceForm(
    $issueDate: String!
    $issuedBy: String!
    $issuedTo: String!
    $physicalStoreId: String!
    $items: [ItemWithQuantityInput]
    $notes: String
  ) {
    createIssuanceForm(
      issueDate: $issueDate
      issuedBy: $issuedBy
      issuedTo: $issuedTo
      physicalStoreId: $physicalStoreId
      items: $items
      notes: $notes
    ) {
      _id
      issueDate
      issuedByName
      issuedToName
      physicalStoreId
      items {
        stockItemId
        quantity
        isInflow
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
    name: "createIssuanceForm",
    options: {
      refetchQueries: [
        "pagedIssuanceForms",
        "issuanceFormsByStockItem",
        "pagedStockItems",
      ],
    },
  }),
  WithBreadcrumbs(["Inventory", "Forms", "Issuance Forms", "New"])
)(NewForm);
