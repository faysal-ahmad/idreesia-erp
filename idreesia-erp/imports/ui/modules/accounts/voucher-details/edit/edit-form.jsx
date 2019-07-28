import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import {
  InputTextField,
  InputTextAreaField,
  InputNumberField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class EditForm extends Component {
  static propTypes = {
    form: PropTypes.object,

    companyId: PropTypes.string,
    voucherDetailId: PropTypes.string,
    handleCloseForm: PropTypes.func,
    formDataLoading: PropTypes.bool,
    voucherDetailById: PropTypes.object,
    updateVoucherDetail: PropTypes.func,
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
      voucherDetailById,
      updateVoucherDetail,
    } = this.props;
    form.validateFields(
      (err, { accountHeadId, creditAmount, debitAmount, description }) => {
        if (err) return;

        updateVoucherDetail({
          variables: {
            _id: voucherDetailById._id,
            companyId: voucherDetailById.companyId,
            voucherId: voucherDetailById.voucherId,
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
    const { form, formDataLoading, voucherDetailById } = this.props;
    if (formDataLoading) return null;
    const { getFieldDecorator } = form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="accountHeadId"
          fieldLabel="Account"
          initialValue={voucherDetailById.accountHeadId}
          required
          requiredMessage="Please select an account."
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="creditAmount"
          fieldLabel="Credit Amount"
          initialValue={
            voucherDetailById.isCredit ? voucherDetailById.amount : 0
          }
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="debitAmount"
          fieldLabel="Debit Amount"
          initialValue={
            voucherDetailById.isCredit ? 0 : voucherDetailById.amount
          }
          minValue={0}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          initialValue={voucherDetailById.description}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query voucherDetailById($_id: String!, $companyId: String!) {
    voucherDetailById(_id: $_id, companyId: $companyId) {
      _id
      companyId
      accountHeadId
      amount
      isCredit
      description
    }
  }
`;

const formMutation = gql`
  mutation updateVoucherDetail(
    $_id: String!
    $companyId: String!
    $voucherId: String!
    $accountHeadId: String!
    $description: String
    $amount: Float
    $isCredit: Boolean
  ) {
    updateVoucherDetail(
      _id: $_id
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
  graphql(formMutation, {
    name: "updateVoucherDetail",
    options: {
      refetchQueries: ["voucherDetailsByVoucherId", "pagedVoucherDetails"],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ companyId, voucherDetailId }) => ({
      variables: { companyId, _id: voucherDetailId },
    }),
  })
)(EditForm);
