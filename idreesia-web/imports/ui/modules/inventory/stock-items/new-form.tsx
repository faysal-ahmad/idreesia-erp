import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withMutation } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
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

import { CREATE_STOCK_ITEM } from './gql';
import allUnitOfMeasurements from './all-unit-of-measurements';

const AntForm = Form as any;
const TextField = InputTextField as any;
const NumberField = InputNumberField as any;
const SelectInputField = SelectField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;

interface PhysicalStore {
  name: string;
}

interface HistoryLike {
  goBack(): void;
}

interface MutateFunction {
  (options: { variables: Record<string, unknown> }): Promise<unknown>;
}

interface ItemCategory {
  _id: string;
  name: string;
}

interface SelectOption {
  _id: string;
  name: string;
}

interface NewFormProps {
  history: HistoryLike;
  physicalStoreId?: string;
  physicalStore?: PhysicalStore;
  itemCategoriesLoading?: boolean;
  itemCategoriesByPhysicalStoreId?: ItemCategory[];
  createStockItem: MutateFunction;
}

interface NewFormState {
  isFieldsTouched: boolean;
}

interface StockItemFormValues {
  name: string;
  company?: string;
  details?: string;
  categoryId: string;
  unitOfMeasurement: string;
  minStockLevel?: number;
  currentStockLevel: number;
}

class NewForm extends Component<NewFormProps, NewFormState> {
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
  };

  handleFinish = ({
    name,
    company,
    details,
    categoryId,
    unitOfMeasurement,
    minStockLevel,
    currentStockLevel,
  }: StockItemFormValues) => {
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { itemCategoriesLoading, itemCategoriesByPhysicalStoreId } =
      this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (itemCategoriesLoading) return null;

    return (
      <AntForm
        layout="horizontal"
        onFinish={this.handleFinish}
        onFieldsChange={this.handleFieldsChange}
      >
        <TextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the stock item."
        />
        <TextField
          fieldName="company"
          fieldLabel="Company"
          required={false}
        />
        <TextField
          fieldName="details"
          fieldLabel="Details"
          required={false}
        />
        <SelectInputField
          data={itemCategoriesByPhysicalStoreId ?? []}
          getDataValue={({ _id }: SelectOption) => _id}
          getDataText={({ name }: SelectOption) => name}
          fieldName="categoryId"
          fieldLabel="Category"
          required
          requiredMessage="Please select an item category."
        />
        <SelectInputField
          data={allUnitOfMeasurements}
          getDataValue={({ _id }: SelectOption) => _id}
          getDataText={({ name }: SelectOption) => name}
          fieldName="unitOfMeasurement"
          fieldLabel="Measurement Unit"
          required
          requiredMessage="Please select a unit of measurement."
        />
        <NumberField
          required
          requiredMessage="Please set the current stock level."
          fieldName="currentStockLevel"
          fieldLabel="Current Stock Level"
        />
        <NumberField
          fieldName="minStockLevel"
          fieldLabel="Min Stock Level"
        />
        <SaveCancelButtons
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
    );
  }
}

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithItemCategoriesByPhysicalStore(),
  withMutation(CREATE_STOCK_ITEM, {
    name: 'createStockItem',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }: { physicalStore?: PhysicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Items, New`;
    }
    return `Inventory, Stock Items, New`;
  })
)(NewForm as any);
