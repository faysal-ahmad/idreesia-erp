import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form } from "antd";
import moment from "moment";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { noop } from "lodash";

import { ItemsList } from "../common/items-list";
import { WithBreadcrumbs } from "/imports/ui/composers";
import { InventorySubModulePaths as paths } from "/imports/ui/modules/inventory";
import {
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
    issuanceFormById: PropTypes.object,
  };

  handleClose = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsPath(physicalStoreId));
  };

  getItemsField() {
    const {
      issuanceFormById,
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
      initialValue: issuanceFormById.items,
    })(
      <ItemsList
        readOnly
        inflowLabel="Returned"
        outflowLabel="Issued"
        physicalStoreId={physicalStoreId}
        stockItemsByPhysicalStore={stockItemsByPhysicalStoreId}
      />
    );
  }

  render() {
    const { stockItemsLoading, formDataLoading, issuanceFormById } = this.props;
    if (stockItemsLoading || formDataLoading) {
      return null;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={noop}>
        <DateField
          fieldName="issueDate"
          fieldLabel="Issue Date"
          initialValue={moment(new Date(issuanceFormById.issueDate))}
          required
          requiredMessage="Please input an issue date."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="issuedBy"
          fieldLabel="Issued By"
          initialValue={issuanceFormById.issuedByName}
          required
          requiredMessage="Please input a name in issued by."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="issuedTo"
          fieldLabel="Issued To"
          initialValue={issuanceFormById.issuedToName}
          required
          requiredMessage="Please input a name in issued to."
          getFieldDecorator={getFieldDecorator}
        />

        <Form.Item label="Issued Items" {...formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>

        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
          initialValue={issuanceFormById.notes}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsClose handleClose={this.handleClose} />
      </Form>
    );
  }
}

const formQuery = gql`
  query issuanceFormById($_id: String!) {
    issuanceFormById(_id: $_id) {
      _id
      issueDate
      issuedBy
      issuedTo
      issuedByName
      issuedToName
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
        itemTypeName
      }
      notes
    }
  }
`;

export default compose(
  Form.create(),
  WithPhysicalStoreId(),
  WithStockItemsByPhysicalStore(),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  }),
  WithBreadcrumbs(["Inventory", "Forms", "Issuance Forms", "View"])
)(ViewForm);
