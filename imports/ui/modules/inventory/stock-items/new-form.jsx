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
import {
  WithPhysicalStoreId,
  WithStockItemsByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object,
    form: PropTypes.object,

    stockItemsLoading: PropTypes.bool,
    stockItemsByPhysicalStoreId: PropTypes.array,

    physicalStoreId: PropTypes.string,
    allItemTypes: PropTypes.array,
    allItemCategories: PropTypes.array,
    createStockItem: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      selectedItemCategoryId: null,
      filteredItemTypes: [],
    };
  }

  getFilteredItemTypes = itemCategoryId => {
    const { allItemTypes, stockItemsByPhysicalStoreId } = this.props;
    let filteredItemTypes = [];

    if (itemCategoryId) {
      const stockItemsByItemTypeId = keyBy(stockItemsByPhysicalStoreId, 'itemTypeId');
      filteredItemTypes = filter(allItemTypes, itemType => {
        if (itemType.itemCategoryId !== itemCategoryId) return false;
        if (stockItemsByItemTypeId[itemType._id]) return false;
        return true;
      });
    }

    return filteredItemTypes;
  };

  handleCategoryChanged = value => {
    const state = Object.assign({}, this.state, {
      selectedItemCategoryId: value,
      filteredItemTypes: this.getFilteredItemTypes(value),
    });
    this.setState(state);
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.stockItemsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, physicalStoreId, createStockItem } = this.props;
    form.validateFields(
      (err, { itemTypeId, minStockLevel, currentStockLevel, totalStockLevel }) => {
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
            history.push(paths.stockItemsPath(physicalStoreId));
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { allItemCategories } = this.props;
    const { filteredItemTypes } = this.state;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
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
  WithPhysicalStoreId(),
  WithStockItemsByPhysicalStore(),
  graphql(itemCategoriesListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(itemTypesListQuery, {
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
