import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { ItemsList } from "../common/items-list";
import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  WithPhysicalStoreId,
  WithLocationsByPhysicalStore,
} from "/imports/ui/modules/inventory/common/composers";
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextField,
  InputTextAreaField,
  TreeSelectField,
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

    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,

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
      (
        err,
        {
          issueDate,
          issuedBy,
          issuedTo,
          handedOverTo,
          locationId,
          items,
          notes,
        }
      ) => {
        if (err) return;

        createIssuanceForm({
          variables: {
            issueDate,
            issuedBy: issuedBy._id,
            issuedTo: issuedTo._id,
            handedOverTo,
            physicalStoreId,
            locationId,
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
        inflowLabel="Returned"
        outflowLabel="Issued"
        physicalStoreId={physicalStoreId}
      />
    );
  }

  render() {
    const { locationsLoading, locationsByPhysicalStoreId } = this.props;
    if (locationsLoading) return null;

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
        <KarkunField
          required
          requiredMessage="Please select a name for Issued By / Received By."
          fieldName="issuedBy"
          fieldLabel="Issued By / Received By"
          placeholder="Issued By / Received By"
          getFieldDecorator={getFieldDecorator}
        />
        <KarkunField
          required
          requiredMessage="Please select a name for Issued To / Returned By."
          fieldName="issuedTo"
          fieldLabel="Issued To / Returned By"
          placeholder="Issued To / Returned By"
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="handedOverTo"
          fieldLabel="Handed Over To / By"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <TreeSelectField
          data={locationsByPhysicalStoreId}
          fieldName="locationId"
          fieldLabel="For Location"
          placeholder="Select a Location"
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
    $handedOverTo: String
    $physicalStoreId: String!
    $locationId: String
    $items: [ItemWithQuantityInput]
    $notes: String
  ) {
    createIssuanceForm(
      issueDate: $issueDate
      issuedBy: $issuedBy
      issuedTo: $issuedTo
      handedOverTo: $handedOverTo
      physicalStoreId: $physicalStoreId
      locationId: $locationId
      items: $items
      notes: $notes
    ) {
      _id
      issueDate
      physicalStoreId
      locationId
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
  WithPhysicalStoreId(),
  WithLocationsByPhysicalStore(),
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
