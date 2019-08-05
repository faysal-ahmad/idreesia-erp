import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import {
  InputTextAreaField,
  InputNumberField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";
import { WithAccountHeadsByCompany } from "/imports/ui/modules/accounts/common/composers";
import { AccountSelectionField } from "/imports/ui/modules/accounts/common/fields";

class NewForm extends Component {
  static propTypes = {
    form: PropTypes.object,

    companyId: PropTypes.string,
    voucherId: PropTypes.string,
    accountHeadsLoading: PropTypes.bool,
    accountHeadsByCompanyId: PropTypes.array,
    handleCloseForm: PropTypes.func,
    createVoucherDetail: PropTypes.func,
  };

  handleCancel = () => {
    const { handleCloseForm } = this.props;
    handleCloseForm();
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      handleCloseForm,
      companyId,
      voucherId,
      createVoucherDetail,
    } = this.props;
    form.validateFields(
      (err, { accountHeadId, creditAmount, debitAmount, description }) => {
        if (err) return;

        createVoucherDetail({
          variables: {
            companyId,
            voucherId,
            accountHeadId,
            amount: creditAmount || debitAmount,
            isCredit: creditAmount !== 0,
            description,
          },
        })
          .then(() => {
            handleCloseForm();
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { accountHeadsLoading, accountHeadsByCompanyId } = this.props;
    if (accountHeadsLoading) return null;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <AccountSelectionField
          data={accountHeadsByCompanyId}
          fieldName="accountHeadId"
          fieldLabel="Account"
          showSearch
          required
          requiredMessage="Please select an account."
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="creditAmount"
          fieldLabel="Credit Amount"
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="debitAmount"
          fieldLabel="Debit Amount"
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createVoucherDetail(
    $companyId: String!
    $voucherId: String!
    $accountHeadId: String!
    $description: String
    $amount: Float
    $isCredit: Boolean
  ) {
    createVoucherDetail(
      companyId: $companyId
      voucherId: $voucherId
      accountHeadId: $accountHeadId
      description: $description
      amount: $amount
      isCredit: $isCredit
    ) {
      _id
      companyId
      accountHeadId
      amount
      isCredit
      description
    }
  }
`;

export default compose(
  Form.create(),
  WithAccountHeadsByCompany(),
  graphql(formMutation, {
    name: "createVoucherDetail",
    options: {
      refetchQueries: ["voucherDetailsByVoucherId", "pagedVoucherDetails"],
    },
  })
)(NewForm);
