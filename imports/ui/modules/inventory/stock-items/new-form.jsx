import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { filter, keyBy } from 'lodash';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  InputNumberField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    allItemTypes: PropTypes.array,
    allAccessiblePhysicalStores: PropTypes.array,
    allItemCategories: PropTypes.array,
    allStockItems: PropTypes.array,
    createStockItem: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedPhysicalStoreId: null,
      selectedItemCategoryId: null,
      filteredItemTypes: [],
    };
  }

  getFilteredItemTypes = (physicalStoreId, itemCategoryId) => {
    const { allItemTypes, allStockItems } = this.props;
    let filteredItemTypes = [];

    if (physicalStoreId && itemCategoryId) {
      const stockItemsInSelectedPhysicalStore = filter(
        allStockItems,
        stockItem => stockItem.physicalStoreId === physicalStoreId
      );

      const stockItemsByItemTypeId = keyBy(stockItemsInSelectedPhysicalStore, 'itemTypeId');
      filteredItemTypes = filter(allItemTypes, itemType => {
        if (itemType.itemCategoryId !== itemCategoryId) return false;
        if (stockItemsByItemTypeId[itemType._id]) return false;
        return true;
      });
    }

    return filteredItemTypes;
  };

  handleStoreChanged = value => {
    const state = Object.assign({}, this.state, {
      selectedPhysicalStoreId: value,
      filteredItemTypes: this.getFilteredItemTypes(value, this.state.selectedItemCategoryId),
    });
    this.setState(state);
  };

  handleCategoryChanged = value => {
    const state = Object.assign({}, this.state, {
      selectedItemCategoryId: value,
      filteredItemTypes: this.getFilteredItemTypes(this.state.selectedPhysicalStoreId, value),
    });
    this.setState(state);
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.stockItemsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, createStockItem } = this.props;
    form.validateFields(
      (err, { physicalStoreId, itemTypeId, minStockLevel, currentStockLevel, totalStockLevel }) => {
        if (err) return;

        createStockItem({
          variables: {
            itemTypeId,
            physicalStoreId,
            minStockLevel,
            currentStockLevel,
            totalStockLevel,
          },
        })
          .then(() => {
            history.push(paths.stockItemsPath);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { allAccessiblePhysicalStores, allItemCategories } = this.props;
    const { filteredItemTypes } = this.state;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <SelectField
          data={allAccessiblePhysicalStores}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="physicalStoreId"
          fieldLabel="Physical Store"
          required
          requiredMessage="Please select a physical store."
          onChange={this.handleStoreChanged}
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          data={allItemCategories}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="itemCategoryId"
          fieldLabel="Item Category"
          required
          requiredMessage="Please select an item category."
          onChange={this.handleCategoryChanged}
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          data={filteredItemTypes}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="itemTypeId"
          fieldLabel="Item Type"
          required
          requiredMessage="Please select an item type."
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="minStockLevel"
          fieldLabel="Min Stock Level"
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="currentStockLevel"
          fieldLabel="Current Stock Level"
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="totalStockLevel"
          fieldLabel="Total Stock Level"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const physicalStoresListQuery = gql`
  query allAccessiblePhysicalStores {
    allAccessiblePhysicalStores {
      _id
      name
    }
  }
`;

const itemCategoriesListQuery = gql`
  query allItemCategories {
    allItemCategories {
      _id
      name
    }
  }
`;

const itemTypesListQuery = gql`
  query allItemTypes {
    allItemTypes {
      _id
      name
      itemCategoryId
    }
  }
`;

const stockItemsListQuery = gql`
  query allStockItems {
    allStockItems {
      _id
      itemTypeId
      physicalStoreId
    }
  }
`;

const formMutation = gql`
  mutation createStockItem(
    $itemTypeId: String!
    $physicalStoreId: String!
    $minStockLevel: Float
    $currentStockLevel: Float
    $totalStockLevel: Float
  ) {
    createStockItem(
      itemTypeId: $itemTypeId
      physicalStoreId: $physicalStoreId
      minStockLevel: $minStockLevel
      currentStockLevel: $currentStockLevel
      totalStockLevel: $totalStockLevel
    ) {
      _id
      itemTypeName
      itemTypePicture
      itemCategoryName
      minStockLevel
      currentStockLevel
      totalStockLevel
    }
  }
`;

export default compose(
  Form.create(),
  graphql(physicalStoresListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(itemCategoriesListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(itemTypesListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(stockItemsListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(formMutation, {
    name: 'createStockItem',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  }),
  WithBreadcrumbs(['Inventory', 'Stock Items', 'New'])
)(NewForm);
