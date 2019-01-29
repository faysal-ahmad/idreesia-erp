import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form } from "antd";
import moment from "moment";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { noop } from "lodash";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import { WithPhysicalStoreId } from "/imports/ui/modules/inventory/common/composers";
import {
  InputTextField,
  DateField,
  FormButtonsClose,
  InputTextAreaField,
} from "/imports/ui/modules/helpers/fields";

const FormStyle = {
  width: "800px",
};

class ViewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,

    formDataLoading: PropTypes.bool,
    stockAdjustmentById: PropTypes.object,
  };

  handleClose = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.stockAdjustmentsPath(physicalStoreId));
  };

  render() {
    const { formDataLoading, stockAdjustmentById } = this.props;
    if (formDataLoading) {
      return null;
    }

    const { getFieldDecorator } = this.props.form;

    let adjustment;
    if (stockAdjustmentById.isInflow) {
      adjustment = `Increased by ${stockAdjustmentById.quantity}`;
    } else {
      adjustment = `Decreased by ${stockAdjustmentById.quantity}`;
    }

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={noop}>
        <InputTextField
          fieldName="stockItemId"
          fieldLabel="Name"
          initialValue={stockAdjustmentById.refStockItem.itemTypeFormattedName}
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="adjustment"
          fieldLabel="Adjustment"
          initialValue={adjustment}
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="adjustedBy"
          fieldLabel="Adjusted By"
          initialValue={stockAdjustmentById.refAdjustedBy.name}
          getFieldDecorator={getFieldDecorator}
        />
        <DateField
          fieldName="adjustedDate"
          fieldLabel="Adjusted Date"
          initialValue={moment(new Date(stockAdjustmentById.adjustmentDate))}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="adjustmentReason"
          fieldLabel="Adjustment Reason"
          initialValue={stockAdjustmentById.adjustmentReason}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsClose handleClose={this.handleClose} />
      </Form>
    );
  }
}

const formQuery = gql`
  query stockAdjustmentById($_id: String!) {
    stockAdjustmentById(_id: $_id) {
      _id
      physicalStoreId
      stockItemId
      adjustmentDate
      adjustedBy
      quantity
      isInflow
      adjustmentReason
      refStockItem {
        _id
        itemTypeName
        itemTypeFormattedName
      }
      refAdjustedBy {
        _id
        name
      }
    }
  }
`;

export default compose(
  Form.create(),
  WithPhysicalStoreId(),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  }),
  WithBreadcrumbs(["Inventory", "Forms", "Stock Adjustments", "View"])
)(ViewForm);
