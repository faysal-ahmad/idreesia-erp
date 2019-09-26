import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight, noop } from "lodash";

import { Divider, Form } from "/imports/ui/controls";
import { ItemsList } from "../common/items-list";
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

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

class ViewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    formDataLoading: PropTypes.bool,
    issuanceFormById: PropTypes.object,
  };

  handleClose = () => {
    const { history } = this.props;
    history.goBack();
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
        defaultLabel="Issued"
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
      <Fragment>
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
            fieldName="handedOverTo"
            fieldLabel="Handed Over To / By"
            initialValue={issuanceFormById.handedOverTo}
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
          <InputTextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            required={false}
            initialValue={issuanceFormById.notes}
            getFieldDecorator={getFieldDecorator}
          />

          <Divider orientation="left">Issued / Returned Items</Divider>
          <Form.Item {...formItemExtendedLayout}>
            {this.getItemsField()}
          </Form.Item>

          <FormButtonsClose handleClose={this.handleClose} />
        </Form>
        <RecordInfo record={issuanceFormById} />
      </Fragment>
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
      handedOverTo
      physicalStoreId
      createdAt
      createdBy
      updatedAt
      updatedBy
      approvedOn
      approvedBy
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
      return `Inventory, ${physicalStore.name}, Issuance Forms, View`;
    }
    return `Inventory, Issuance Forms, View`;
  })
)(ViewForm);
