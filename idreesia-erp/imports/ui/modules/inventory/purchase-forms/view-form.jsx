import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form } from "antd";
import moment from "moment";
import { noop } from "lodash";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { ItemsList } from "../common/items-list";
import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
  WithKarkuns,
  WithPhysicalStoreId,
  WithStockItemsByPhysicalStore,
} from "/imports/ui/modules/inventory/common/composers";
import {
  InputTextField,
  DateField,
  FormButtonsClose,
  InputTextAreaField,
} from "/imports/ui/modules/helpers/fields";

const FormStyle = {
  width: "800px",
};

const formItemExtendedLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

class ViewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,

    stockItemsLoading: PropTypes.bool,
    stockItemsByPhysicalStoreId: PropTypes.array,
    formDataLoading: PropTypes.bool,
    purchaseFormById: PropTypes.object,
  };

  handleClose = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.purchaseFormsPath(physicalStoreId));
  };

  getItemsField() {
    const {
      purchaseFormById,
      physicalStoreId,
      stockItemsByPhysicalStoreId,
    } = this.props;
    const { getFieldDecorator } = this.props.form;

    const rules = [
      {
        required: true,
        message: "Please add some items.",
      },
    ];
    return getFieldDecorator("items", {
      rules,
      initialValue: purchaseFormById.items,
    })(
      <ItemsList
        inflowLabel="Purchased"
        outflowLabel="Returned"
        physicalStoreId={physicalStoreId}
        stockItemsByPhysicalStore={stockItemsByPhysicalStoreId}
      />
    );
  }

  render() {
    const { stockItemsLoading, formDataLoading, purchaseFormById } = this.props;
    if (stockItemsLoading || formDataLoading) {
      return null;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={noop}>
        <DateField
          fieldName="purchaseDate"
          fieldLabel="Purchase Date"
          initialValue={moment(new Date(purchaseFormById.purchaseDate))}
          required
          requiredMessage="Please input a purchase date."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="receivedBy"
          fieldLabel="Received By"
          initialValue={purchaseFormById.receivedByName}
          required
          requiredMessage="Please input a name in received by."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="purchasedBy"
          fieldLabel="Purchaseed By"
          initialValue={purchaseFormById.purchasedByName}
          required
          requiredMessage="Please input a name in purchased by."
          getFieldDecorator={getFieldDecorator}
        />

        <Form.Item label="Purchaseed Items" {...formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>

        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
          initialValue={purchaseFormById.notes}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsClose handleClose={this.handleClose} />
      </Form>
    );
  }
}

const formQuery = gql`
  query purchaseFormById($_id: String!) {
    purchaseFormById(_id: $_id) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      receivedByName
      purchasedByName
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
        price
        itemTypeName
      }
      notes
    }
  }
`;

export default compose(
  Form.create(),
  WithKarkuns(),
  WithPhysicalStoreId(),
  WithStockItemsByPhysicalStore(),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  }),
  WithBreadcrumbs(["Inventory", "Forms", "Purchase Forms", "View"])
)(ViewForm);
