import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';
import numeral from 'numeral';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  InputTextField,
  InputNumberField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { WithItemCategoriesByPhysicalStore } from '/imports/ui/modules/inventory/common/composers';
import { AuditInfo } from '/imports/ui/modules/common';

import allUnitOfMeasurements from '../all-unit-of-measurements';

class EditForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,

    itemCategoriesLoading: PropTypes.bool,
    itemCategoriesByPhysicalStoreId: PropTypes.array,
    loading: PropTypes.bool,
    stockItemById: PropTypes.object,
    updateStockItem: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, company, details, categoryId, unitOfMeasurement, minStockLevel }) => {
    const { stockItemById, updateStockItem, history } = this.props;
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
  };

  render() {
    const {
      loading,
      itemCategoriesLoading,
      stockItemById,
      itemCategoriesByPhysicalStoreId,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading || itemCategoriesLoading) return null;

    return (
      <>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={stockItemById.name}
            required
            requiredMessage="Please input a name for the stock item."
          />
          <InputTextField
            fieldName="company"
            fieldLabel="Company"
            initialValue={stockItemById.company}
            required={false}
          />
          <InputTextField
            fieldName="details"
            fieldLabel="Details"
            initialValue={stockItemById.details}
            required={false}
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
          />
          <InputNumberField
            disabled
            fieldName="startingStockLevel"
            fieldLabel="Starting Stock Level"
            initialValue={stockItemById.startingStockLevel}
          />
          <InputNumberField
            disabled
            fieldName="currentStockLevel"
            fieldLabel="Current Stock Level"
            initialValue={numeral(stockItemById.currentStockLevel).format('0.00')}
          />
          <InputNumberField
            fieldName="minStockLevel"
            fieldLabel="Min Stock Level"
            initialValue={stockItemById.minStockLevel}
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={stockItemById} />
      </>
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
      startingStockLevel
      currentStockLevel
      minStockLevel
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default flowRight(
  WithItemCategoriesByPhysicalStore(),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ stockItemId }) => ({ variables: { _id: stockItemId } }),
  }),
  graphql(formMutation, {
    name: 'updateStockItem',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  })
)(EditForm);
