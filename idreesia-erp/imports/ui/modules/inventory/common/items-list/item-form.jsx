import React from "react";
import PropTypes from "prop-types";
import { Button, Form, Row } from "antd";
import {
  InputNumberField,
  SelectField,
} from "/imports/ui/modules/helpers/fields";
import { StockItemField } from "/imports/ui/modules/inventory/stock-items/field";

const RowStyle = {
  height: "40px",
};
const ButtonContainerStyle = {
  paddingLeft: "20px",
};

const ItemForm = ({
  refForm: { getFieldDecorator },
  physicalStoreId,
  inflowLabel,
  outflowLabel,
  handleAddItem,
}) => (
  <Row type="flex" justify="start" style={RowStyle}>
    <StockItemField
      physicalStoreId={physicalStoreId}
      fieldLayout={null}
      fieldName="stockItem"
      placeholder="Stock Item"
      getFieldDecorator={getFieldDecorator}
    />
    <InputNumberField
      fieldName="quantity"
      placeholder="Quantity"
      fieldLayout={null}
      minValue={1}
      getFieldDecorator={getFieldDecorator}
    />
    <SelectField
      allowClear={false}
      data={[
        { label: inflowLabel, value: "inflow" },
        { label: outflowLabel, value: "outflow" },
      ]}
      getDataValue={({ value }) => value}
      getDataText={({ label }) => label}
      initialValue="inflow"
      fieldLayout={null}
      fieldName="status"
      getFieldDecorator={getFieldDecorator}
    />
    <Form.Item style={ButtonContainerStyle}>
      <Button type="primary" icon="plus-circle-o" onClick={handleAddItem}>
        Add Item
      </Button>
    </Form.Item>
  </Row>
);

ItemForm.propTypes = {
  refForm: PropTypes.object,
  physicalStoreId: PropTypes.string,
  stockItems: PropTypes.array,
  inflowLabel: PropTypes.string,
  outflowLabel: PropTypes.string,
  handleAddItem: PropTypes.func,
};

export default Form.create()(ItemForm);
