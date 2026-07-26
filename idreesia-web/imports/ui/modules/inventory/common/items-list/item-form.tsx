import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Row } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import {
  InputNumberField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { StockItemField } from '/imports/ui/modules/inventory/stock-items/field';

const AntButton = Button as any;
const AntFormItem = Form.Item as any;
const AntRow = Row as any;
const AntPlusCircleOutlined = PlusCircleOutlined as any;
const InventoryStockItemField = StockItemField as any;
const NumberField = InputNumberField as any;
const SelectInputField = SelectField as any;

const RowStyle = {
  height: '40px',
};
const ButtonContainerStyle = {
  paddingLeft: '20px',
};

interface SelectOption {
  label: string;
  value: string;
}

interface ItemFormProps {
  physicalStoreId?: string;
  defaultLabel?: string;
  inflowLabel?: string;
  outflowLabel?: string;
  handleAddItem?: () => void;
  showPrice?: boolean;
}

const ItemForm = ({
  physicalStoreId,
  defaultLabel = 'Inflow',
  inflowLabel = 'Inflow',
  outflowLabel = 'Outflow',
  handleAddItem,
  showPrice,
}: ItemFormProps) => (
  <>
    <AntRow type="flex" justify="end" style={RowStyle}>
      <InventoryStockItemField
        physicalStoreId={physicalStoreId}
        fieldLayout={null}
        fieldName="stockItem"
        placeholder="Stock Item"
      />
      <NumberField
        fieldName="quantity"
        placeholder="Quantity"
        fieldLayout={null}
        minValue={0}
        precision={2}
      />
      {showPrice ? (
        <NumberField
          fieldName="price"
          placeholder="Price"
          fieldLayout={null}
          minValue={0}
          precision={2}
        />
      ) : null}
      <SelectInputField
        allowClear={false}
        dropdownMatchSelectWidth={false}
        data={[
          { label: inflowLabel, value: 'inflow' },
          { label: outflowLabel, value: 'outflow' },
        ]}
        getDataValue={({ value }: SelectOption) => value}
        getDataText={({ label }: SelectOption) => label}
        initialValue={defaultLabel === inflowLabel ? 'inflow' : 'outflow'}
        fieldLayout={null}
        fieldName="status"
      />
    </AntRow>
    <AntRow type="flex" justify="end" style={RowStyle}>
      <AntFormItem style={ButtonContainerStyle}>
        <AntButton
          type="primary"
          icon={<AntPlusCircleOutlined />}
          onClick={handleAddItem}
        >
          Add Item
        </AntButton>
      </AntFormItem>
    </AntRow>
  </>
);

ItemForm.propTypes = {
  physicalStoreId: PropTypes.string,
  stockItems: PropTypes.array,
  defaultLabel: PropTypes.string,
  inflowLabel: PropTypes.string,
  outflowLabel: PropTypes.string,
  showPrice: PropTypes.bool,
  handleAddItem: PropTypes.func,
};

export default ItemForm;
