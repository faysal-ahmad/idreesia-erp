import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withMutation } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { Form, message } from 'antd';
import numeral from 'numeral';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  InputTextField,
  InputNumberField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

import allUnitOfMeasurements from '../all-unit-of-measurements';
import { UPDATE_STOCK_ITEM } from '../gql';

const AntForm = Form as any;
const TextField = InputTextField as any;
const NumberField = InputNumberField as any;
const SelectInputField = SelectField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const AuditInfoComponent = AuditInfo as any;

interface HistoryLike {
  goBack(): void;
}

interface StockItem {
  _id: string;
  physicalStoreId: string;
  name: string;
  company?: string;
  details?: string;
  categoryId?: string;
  unitOfMeasurement?: string;
  startingStockLevel?: number;
  currentStockLevel?: number;
  minStockLevel?: number;
}

interface ItemCategory {
  _id: string;
  name: string;
}

interface SelectOption {
  _id: string;
  name: string;
}

interface MutateFunction {
  (options: { variables: Record<string, unknown> }): Promise<unknown>;
}

interface EditFormProps {
  history: HistoryLike;
  stockItemById: StockItem;
  itemCategoriesByPhysicalStoreId?: ItemCategory[];
  updateStockItem: MutateFunction;
}

interface EditFormState {
  isFieldsTouched: boolean;
}

interface StockItemFormValues {
  name: string;
  company?: string;
  details?: string;
  categoryId?: string;
  unitOfMeasurement?: string;
  minStockLevel?: number;
}

class EditForm extends Component<EditFormProps, EditFormState> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    stockItemById: PropTypes.object,
    itemCategoriesByPhysicalStoreId: PropTypes.array,

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
  };

  handleFinish = ({
    name,
    company,
    details,
    categoryId,
    unitOfMeasurement,
    minStockLevel,
  }: StockItemFormValues) => {
    const { stockItemById, updateStockItem, history } = this.props;
    updateStockItem({
      variables: {
        _id: stockItemById._id,
        physicalStoreId: stockItemById.physicalStoreId,
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  render() {
    const isFieldsTouched = this.state.isFieldsTouched;
    const { stockItemById, itemCategoriesByPhysicalStoreId } = this.props;

    return (
      <>
        <AntForm
          layout="horizontal"
          onFinish={this.handleFinish}
          onFieldsChange={this.handleFieldsChange}
        >
          <TextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={stockItemById.name}
            required
            requiredMessage="Please input a name for the stock item."
          />
          <TextField
            fieldName="company"
            fieldLabel="Company"
            initialValue={stockItemById.company}
            required={false}
          />
          <TextField
            fieldName="details"
            fieldLabel="Details"
            initialValue={stockItemById.details}
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
            initialValue={stockItemById.categoryId}
          />
          <SelectInputField
            data={allUnitOfMeasurements}
            getDataValue={({ _id }: SelectOption) => _id}
            getDataText={({ name }: SelectOption) => name}
            fieldName="unitOfMeasurement"
            fieldLabel="Measurement Unit"
            required
            requiredMessage="Please select a unit of measurement."
            initialValue={stockItemById.unitOfMeasurement}
          />
          <NumberField
            disabled
            fieldName="startingStockLevel"
            fieldLabel="Starting Stock Level"
            initialValue={stockItemById.startingStockLevel}
          />
          <NumberField
            disabled
            fieldName="currentStockLevel"
            fieldLabel="Current Stock Level"
            initialValue={numeral(stockItemById.currentStockLevel).format(
              '0.00'
            )}
          />
          <NumberField
            fieldName="minStockLevel"
            fieldLabel="Min Stock Level"
            initialValue={stockItemById.minStockLevel}
          />
          <SaveCancelButtons
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </AntForm>
        <AuditInfoComponent record={stockItemById} />
      </>
    );
  }
}

export default flowRight(
  withMutation(UPDATE_STOCK_ITEM, {
    name: 'updateStockItem',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  })
)(EditForm as any);
