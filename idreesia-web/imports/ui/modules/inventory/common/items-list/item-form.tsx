import React, { type CSSProperties } from 'react';
import { Button, Form, Row } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import {
  InputNumberField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { StockItemField } from '/imports/ui/modules/inventory/stock-items/field';

const RowStyle: CSSProperties = {
  height: '40px',
};

const ButtonContainerStyle: CSSProperties = {
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
  refForm?: unknown;
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
    <Row justify="end" style={RowStyle}>
      <StockItemField
        physicalStoreId={physicalStoreId}
        fieldName="stockItem"
        placeholder="Stock Item"
      />
      <InputNumberField
        fieldName="quantity"
        placeholder="Quantity"
        minValue={0}
        precision={2}
      />
      {showPrice ? (
        <InputNumberField
          fieldName="price"
          placeholder="Price"
          minValue={0}
          precision={2}
        />
      ) : null}
      <SelectField<SelectOption>
        allowClear={false}
        dropdownMatchSelectWidth={false}
        data={[
          { label: inflowLabel, value: 'inflow' },
          { label: outflowLabel, value: 'outflow' },
        ]}
        getDataValue={({ value }) => value}
        getDataText={({ label }) => label}
        initialValue={defaultLabel === inflowLabel ? 'inflow' : 'outflow'}
        fieldName="status"
      />
    </Row>
    <Row justify="end" style={RowStyle}>
      <Form.Item style={ButtonContainerStyle}>
        <Button
          type="primary"
          icon={<PlusCircleOutlined />}
          onClick={handleAddItem}
        >
          Add Item
        </Button>
      </Form.Item>
    </Row>
  </>
);

export default ItemForm;
