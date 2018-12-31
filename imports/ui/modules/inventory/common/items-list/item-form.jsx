import React from "react";
import PropTypes from "prop-types";
import { Form } from "antd";
import {
  AutoCompleteField,
  InputNumberField,
} from "/imports/ui/modules/helpers/fields";

const OptionStyle = {
  display: "flex",
  flexFlow: "row nowrap",
  justifyContent: "space-between",
  width: "100%",
};

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 14 },
};

const ItemForm = ({ form: { getFieldDecorator }, stockItems }) => (
  <Form layout="horizontal">
    <AutoCompleteField
      data={stockItems}
      getDataValue={({ _id }) => _id}
      getDataText={({ itemTypeFormattedName }) => itemTypeFormattedName}
      fieldName="stockItemId"
      fieldLabel="Name"
      fieldLayout={formItemLayout}
      required
      requiredMessage="Please input a name for the item."
      getFieldDecorator={getFieldDecorator}
      optionRenderer={(text, dataObj) => (
        <div key={dataObj.stockItemId} style={OptionStyle}>
          {dataObj.itemTypeFormattedName}
          <span>{dataObj.currentStockLevel} Available</span>
        </div>
      )}
    />

    <InputNumberField
      fieldName="quantity"
      fieldLabel="Quantity"
      fieldLayout={formItemLayout}
      required
      requiredMessage="Please input a value for quantity."
      minValue={0}
      getFieldDecorator={getFieldDecorator}
    />
  </Form>
);

ItemForm.propTypes = {
  form: PropTypes.object,
  stockItems: PropTypes.array,
};

export default Form.create()(ItemForm);
