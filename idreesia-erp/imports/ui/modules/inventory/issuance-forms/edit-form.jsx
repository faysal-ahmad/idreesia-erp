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
  WithPhysicalStoreId,
  WithLocationsByPhysicalStore,
} from "/imports/ui/modules/inventory/common/composers";
import {
  DateField,
  InputTextField,
  FormButtonsSaveCancel,
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

class EditForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,

    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    formDataLoading: PropTypes.bool,
    issuanceFormById: PropTypes.object,
    updateIssuanceForm: PropTypes.func,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      physicalStoreId,
      updateIssuanceForm,
      issuanceFormById: { _id },
    } = this.props;
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

        const updatedItems = items.map(
          ({ stockItemId, quantity, isInflow }) => ({
            stockItemId,
            quantity,
            isInflow,
          })
        );
        updateIssuanceForm({
          variables: {
            _id,
            issueDate,
            issuedBy: issuedBy._id,
            issuedTo: issuedTo._id,
            handedOverTo,
            locationId,
            physicalStoreId,
            items: updatedItems,
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
    const { form, physicalStoreId, issuanceFormById } = this.props;
    const { getFieldDecorator } = form;

    const rules = [
      {
        required: true,
        message: "Please add some items.",
      },
    ];
    return getFieldDecorator("items", {
      rules,
      initialValue: issuanceFormById.items,
    })(
      <ItemsList
        refForm={form}
        inflowLabel="Returned"
        outflowLabel="Issued"
        physicalStoreId={physicalStoreId}
      />
    );
  }

  render() {
    const {
      locationsLoading,
      formDataLoading,
      issuanceFormById,
      locationsByPhysicalStoreId,
    } = this.props;
    if (locationsLoading || formDataLoading) {
      return null;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={this.handleSubmit}>
        <DateField
          fieldName="issueDate"
          fieldLabel="Issue Date"
          initialValue={moment(Number(issuanceFormById.issueDate))}
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
          initialValue={issuanceFormById.refIssuedBy}
          getFieldDecorator={getFieldDecorator}
        />
        <KarkunField
          required
          requiredMessage="Please select a name for Issued To / Returned By."
          fieldName="issuedTo"
          fieldLabel="Issued To / Returned By"
          placeholder="Issued To / Returned By"
          initialValue={issuanceFormById.refIssuedTo}
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="handedOverTo"
          fieldLabel="Handed Over To / By"
          required={false}
          initialValue={issuanceFormById.handedOverTo}
          getFieldDecorator={getFieldDecorator}
        />
        <TreeSelectField
          data={locationsByPhysicalStoreId}
          fieldName="locationId"
          fieldLabel="For Location"
          placeholder="Select a Location"
          initialValue={issuanceFormById.locationId}
          getFieldDecorator={getFieldDecorator}
        />

        <Form.Item label="Issued Items" {...formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>

        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
          initialValue={issuanceFormById.notes}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation updateIssuanceForm(
    $_id: String!
    $issueDate: String!
    $issuedBy: String!
    $issuedTo: String!
    $handedOverTo: String
    $locationId: String
    $physicalStoreId: String!
    $items: [ItemWithQuantityInput]
    $notes: String
  ) {
    updateIssuanceForm(
      _id: $_id
      issueDate: $issueDate
      issuedBy: $issuedBy
      issuedTo: $issuedTo
      handedOverTo: $handedOverTo
      locationId: $locationId
      physicalStoreId: $physicalStoreId
      items: $items
      notes: $notes
    ) {
      _id
      issueDate
      locationId
      physicalStoreId
      items {
        stockItemId
        quantity
        isInflow
      }
      refIssuedBy {
        _id
        name
      }
      refIssuedTo {
        _id
        name
      }
      notes
    }
  }
`;

const formQuery = gql`
  query issuanceFormById($_id: String!) {
    issuanceFormById(_id: $_id) {
      _id
      issueDate
      issuedBy
      issuedTo
      handedOverTo
      locationId
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
      }
      refIssuedBy {
        _id
        name
      }
      refIssuedTo {
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
  WithLocationsByPhysicalStore(),
  graphql(formMutation, {
    name: "updateIssuanceForm",
    options: {
      refetchQueries: [
        "pagedIssuanceForms",
        "issuanceFormsByStockItem",
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
  WithBreadcrumbs(["Inventory", "Forms", "Issuance Forms", "Edit"])
)(EditForm);
