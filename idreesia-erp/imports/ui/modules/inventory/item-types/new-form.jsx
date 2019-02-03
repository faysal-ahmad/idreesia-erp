import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  InputTextField,
  SelectField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

import allUnitOfMeasurements from "./all-unit-of-measurements";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    allItemCategories: PropTypes.array,
    createItemType: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.itemTypesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, createItemType } = this.props;
    form.validateFields(
      (
        err,
        {
          name,
          company,
          details,
          description,
          itemCategoryId,
          unitOfMeasurement,
          singleUse,
        }
      ) => {
        if (err) return;

        createItemType({
          variables: {
            name,
            company,
            details,
            description,
            itemCategoryId,
            unitOfMeasurement,
            singleUse,
          },
        })
          .then(() => {
            history.push(paths.itemTypesPath);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { loading, allItemCategories } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Item Type Name"
          required
          requiredMessage="Please input a name for the item type."
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
          fieldName="itemCategoryId"
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
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const listQuery = gql`
  query allItemCategories {
    allItemCategories {
      _id
      name
    }
  }
`;

const formMutation = gql`
  mutation createItemType(
    $name: String!
    $urduName: String
    $company: String
    $details: String
    $unitOfMeasurement: String!
    $itemCategoryId: String!
  ) {
    createItemType(
      name: $name
      urduName: $urduName
      company: $company
      details: $details
      unitOfMeasurement: $unitOfMeasurement
      itemCategoryId: $itemCategoryId
    ) {
      _id
      name
      urduName
      company
      details
      unitOfMeasurement
      formattedUOM
      itemCategoryId
      itemCategoryName
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "createItemType",
    options: {
      refetchQueries: ["allItemTypes", "pagedItemTypes"],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  WithBreadcrumbs(["Inventory", "Setup", "Item Types", "New"])
)(NewForm);
