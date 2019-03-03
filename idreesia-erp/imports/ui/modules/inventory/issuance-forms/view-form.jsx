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

    formDataLoading: PropTypes.bool,
    issuanceFormById: PropTypes.object,
  };

  handleClose = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsPath(physicalStoreId));
  };

  getItemsField() {
    const { form, issuanceFormById, physicalStoreId } = this.props;
    const { getFieldDecorator } = form;

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
        refForm={form}
        inflowLabel="Returned"
        outflowLabel="Issued"
        physicalStoreId={physicalStoreId}
      />
    );
  }

  render() {
    const { formDataLoading, issuanceFormById } = this.props;
    if (formDataLoading) {
      return null;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={noop}>
        <DateField
          fieldName="issueDate"
          fieldLabel="Issue Date"
          initialValue={moment(Number(issuanceFormById.issueDate))}
          required
          requiredMessage="Please input an issue date."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="issuedBy"
          fieldLabel="Issued By"
          initialValue={issuanceFormById.refIssuedBy.name}
          required
          requiredMessage="Please input a name in issued by."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="issuedTo"
          fieldLabel="Issued To"
          initialValue={issuanceFormById.refIssuedTo.name}
          required
          requiredMessage="Please input a name in issued to."
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="locationId"
          fieldLabel="For Location"
          initialValue={
            issuanceFormById.refLocation
              ? issuanceFormById.refLocation.name
              : null
          }
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
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
      }
      refLocation {
        _id
        name
      }
      refIssuedBy {
        _id
        name
      }
      refIssuedTo {
        _id
        name
      }
      notes
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
  WithBreadcrumbs(["Inventory", "Forms", "Issuance Forms", "View"])
)(ViewForm);
