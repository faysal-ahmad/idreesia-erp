import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  InputTextField,
  SelectField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

import allUnitOfMeasurements from "../all-unit-of-measurements";

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    itemTypeId: PropTypes.string,
    itemTypeById: PropTypes.object,
    updateItemType: PropTypes.func,

    listData: PropTypes.shape({
      loading: PropTypes.bool,
      allItemCategories: PropTypes.array,
    }),
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.itemTypesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, itemTypeById, updateItemType } = this.props;
    form.validateFields(
      (
        err,
        { name, description, itemCategoryId, unitOfMeasurement, singleUse }
      ) => {
        if (err) return;

        updateItemType({
          variables: {
            _id: itemTypeById._id,
            name,
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
    const { loading, itemTypeById, listData } = this.props;
    const { allItemCategories, loading: listLoading } = listData;
    if (loading || listLoading) return null;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Item Type Name"
          initialValue={itemTypeById.name}
          required
          requiredMessage="Please input a name for the item type."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="company"
          fieldLabel="Company"
          initialValue={itemTypeById.company}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="details"
          fieldLabel="Details"
          initialValue={itemTypeById.details}
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
          initialValue={itemTypeById.itemCategoryId}
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
          initialValue={itemTypeById.unitOfMeasurement}
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query itemTypeById($_id: String!) {
    itemTypeById(_id: $_id) {
      _id
      name
      urduName
      company
      details
      unitOfMeasurement
      itemCategoryId
    }
  }
`;

const listQuery = gql`
  query allItemCategories {
    allItemCategories {
      _id
      name
    }
  }
`;

const formMutation = gql`
  mutation updateItemType(
    $_id: String!
    $name: String!
    $urduName: String
    $company: String
    $details: String
    $unitOfMeasurement: String!
    $itemCategoryId: String!
  ) {
    updateItemType(
      _id: $_id
      name: $name
      urduName: $urduName
      compant: $company
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
    name: "updateItemType",
    options: {
      refetchQueries: ["allItemTypes", "pagedItemTypes"],
    },
  }),
  graphql(listQuery, {
    name: "listData",
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ itemTypeId }) => ({ variables: { _id: itemTypeId } }),
  })
)(GeneralInfo);
