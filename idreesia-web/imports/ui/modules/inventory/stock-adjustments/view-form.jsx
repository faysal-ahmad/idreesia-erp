import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import { Form } from "antd";
import moment from "moment";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight, noop } from "lodash";

import { WithDynamicBreadcrumbs } from "/imports/ui/composers";
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from "/imports/ui/modules/inventory/common/composers";
import {
  InputTextField,
  DateField,
  FormButtonsClose,
  InputTextAreaField,
} from "/imports/ui/modules/helpers/fields";
import { RecordInfo } from "/imports/ui/modules/helpers/controls";

const FormStyle = {
  width: "800px",
};

class ViewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    formDataLoading: PropTypes.bool,
    stockAdjustmentById: PropTypes.object,
  };

  handleClose = () => {
    const { history } = this.props;
    history.goBack();
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
      <Fragment>
        <Form layout="horizontal" style={FormStyle} onSubmit={noop}>
          <InputTextField
            fieldName="stockItemId"
            fieldLabel="Stock Item Name"
            initialValue={stockAdjustmentById.refStockItem.formattedName}
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
            initialValue={moment(Number(stockAdjustmentById.adjustmentDate))}
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
        <RecordInfo record={stockAdjustmentById} />
      </Fragment>
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
      createdAt
      createdBy
      updatedAt
      updatedBy
      approvedOn
      approvedBy
      refStockItem {
        _id
        name
        formattedName
      }
      refAdjustedBy {
        _id
        name
      }
    }
  }
`;

export default flowRight(
  Form.create(),
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Adjustments, View`;
    }
    return `Inventory, Stock Adjustments, View`;
  })
)(ViewForm);
