import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  InputNumberField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithItemCategoriesByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';

import allUnitOfMeasurements from './all-unit-of-measurements';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    itemCategoriesLoading: PropTypes.bool,
    itemCategoriesByPhysicalStoreId: PropTypes.array,
    createStockItem: PropTypes.func,
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

  handleFinish = ({
    name,
    company,
    details,
    categoryId,
    unitOfMeasurement,
    minStockLevel,
    currentStockLevel,
  }) => {
    const { history, physicalStoreId, createStockItem } = this.props;
    createStockItem({
      variables: {
        name,
        company,
        details,
        categoryId,
        unitOfMeasurement,
        physicalStoreId,
        minStockLevel,
        currentStockLevel,
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
      itemCategoriesLoading,
      itemCategoriesByPhysicalStoreId,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (itemCategoriesLoading) return null;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the stock item."
        />
        <InputTextField
          fieldName="company"
          fieldLabel="Company"
          required={false}
        />
        <InputTextField
          fieldName="details"
          fieldLabel="Details"
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
        />
        <SelectField
          data={allUnitOfMeasurements}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="unitOfMeasurement"
          fieldLabel="Measurement Unit"
          required
          requiredMessage="Please select a unit of measurement."
        />
        <InputNumberField
          required
          requiredMessage="Please set the current stock level."
          fieldName="currentStockLevel"
          fieldLabel="Current Stock Level"
        />
        <InputNumberField
          fieldName="minStockLevel"
          fieldLabel="Min Stock Level"
        />
        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createStockItem(
    $name: String!
    $company: String
    $details: String
    $unitOfMeasurement: String!
    $categoryId: String!
    $physicalStoreId: String!
    $minStockLevel: Float
    $currentStockLevel: Float
  ) {
    createStockItem(
      name: $name
      company: $company
      details: $details
      unitOfMeasurement: $unitOfMeasurement
      categoryId: $categoryId
      physicalStoreId: $physicalStoreId
      minStockLevel: $minStockLevel
      currentStockLevel: $currentStockLevel
    ) {
      _id
      name
      company
      details
      unitOfMeasurement
      categoryId
      physicalStoreId
      minStockLevel
      currentStockLevel
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithItemCategoriesByPhysicalStore(),
  graphql(formMutation, {
    name: 'createStockItem',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Items, New`;
    }
    return `Inventory, Stock Items, New`;
  })
)(NewForm);
