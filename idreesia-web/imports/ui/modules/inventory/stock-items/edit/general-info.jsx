import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import {
  InputTextField,
  InputNumberField,
  SelectField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";
import { WithItemCategoriesByPhysicalStore } from "/imports/ui/modules/inventory/common/composers";
import { RecordInfo } from "/imports/ui/modules/helpers/controls";

import allUnitOfMeasurements from "../all-unit-of-measurements";

class EditForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,

    itemCategoriesLoading: PropTypes.bool,
    itemCategoriesByPhysicalStoreId: PropTypes.array,
    loading: PropTypes.bool,
    stockItemById: PropTypes.object,
    updateStockItem: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { stockItemById, updateStockItem, form, history } = this.props;
    form.validateFields(
      (
        err,
        { name, company, details, categoryId, unitOfMeasurement, minStockLevel }
      ) => {
        if (err) return;
        updateStockItem({
          variables: {
            _id: stockItemById._id,
            name,
            company,
            details,
            categoryId,
            unitOfMeasurement,
            minStockLevel,
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

  render() {
    const {
      loading,
      itemCategoriesLoading,
      stockItemById,
      itemCategoriesByPhysicalStoreId,
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading || itemCategoriesLoading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={stockItemById.name}
            required
            requiredMessage="Please input a name for the stock item."
            getFieldDecorator={getFieldDecorator}
          />
          <InputTextField
            fieldName="company"
            fieldLabel="Company"
            initialValue={stockItemById.company}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />
          <InputTextField
            fieldName="details"
            fieldLabel="Details"
            initialValue={stockItemById.details}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />
          <SelectField
            data={itemCategoriesByPhysicalStoreId}
            getDataValue={({ _id }) => _id}
            getDataText={({ name }) => name}
            fieldName="categoryId"
            fieldLabel="Category"
            required
            requiredMessage="Please select an item category."
            initialValue={stockItemById.categoryId}
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
            initialValue={stockItemById.unitOfMeasurement}
            getFieldDecorator={getFieldDecorator}
          />
          <InputNumberField
            fieldName="minStockLevel"
            fieldLabel="Min Stock Level"
            initialValue={stockItemById.minStockLevel}
            getFieldDecorator={getFieldDecorator}
          />
          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={stockItemById} />
      </Fragment>
    );
  }
}

const formMutation = gql`
  mutation updateStockItem(
    $_id: String!
    $name: String!
    $company: String
    $details: String
    $unitOfMeasurement: String!
    $categoryId: String!
    $minStockLevel: Float
  ) {
    updateStockItem(
      _id: $_id
      name: $name
      company: $company
      details: $details
      unitOfMeasurement: $unitOfMeasurement
      categoryId: $categoryId
      minStockLevel: $minStockLevel
    ) {
      _id
      name
      company
      details
      categoryId
      unitOfMeasurement
      minStockLevel
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formQuery = gql`
  query stockItemById($_id: String!) {
    stockItemById(_id: $_id) {
      _id
      name
      company
      details
      categoryId
      unitOfMeasurement
      minStockLevel
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default flowRight(
  Form.create(),
  WithItemCategoriesByPhysicalStore(),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ stockItemId }) => ({ variables: { _id: stockItemId } }),
  }),
  graphql(formMutation, {
    name: "updateStockItem",
    options: {
      refetchQueries: ["pagedStockItems"],
    },
  })
)(EditForm);
