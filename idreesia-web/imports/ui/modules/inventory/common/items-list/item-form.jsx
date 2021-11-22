import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Row } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import {
  InputNumberField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { StockItemField } from '/imports/ui/modules/inventory/stock-items/field';

const RowStyle = {
  height: '40px',
};
const ButtonContainerStyle = {
  paddingLeft: '20px',
};

const ItemForm = ({
  physicalStoreId,
  defaultLabel,
  inflowLabel,
  outflowLabel,
  handleAddItem,
  showPrice,
}) => (
  <Row type="flex" justify="start" style={RowStyle}>
    <StockItemField
      physicalStoreId={physicalStoreId}
      fieldLayout={null}
      fieldName="stockItem"
      placeholder="Stock Item"
    />
    <InputNumberField
      fieldName="quantity"
      placeholder="Quantity"
      fieldLayout={null}
      minValue={0}
      precision={2}
    />
    {showPrice ? (
      <InputNumberField
        fieldName="price"
        placeholder="Price"
        fieldLayout={null}
        minValue={0}
        precision={2}
      />
    ) : null}
    <SelectField
      allowClear={false}
      dropdownMatchSelectWidth={false}
      data={[
        { label: inflowLabel, value: 'inflow' },
        { label: outflowLabel, value: 'outflow' },
      ]}
      getDataValue={({ value }) => value}
      getDataText={({ label }) => label}
      initialValue={defaultLabel === inflowLabel ? 'inflow' : 'outflow'}
      fieldLayout={null}
      fieldName="status"
    />
    <Form.Item style={ButtonContainerStyle}>
      <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleAddItem}>
        Add Item
      </Button>
    </Form.Item>
  </Row>
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
