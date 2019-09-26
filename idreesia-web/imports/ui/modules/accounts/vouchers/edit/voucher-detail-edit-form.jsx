import React, { Component } from "react";
import PropTypes from "prop-types";
import { find, flowRight } from "lodash";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

import { Button, Col, Form, Row, message } from "/imports/ui/controls";
import {
  InputTextField,
  InputNumberField,
} from "/imports/ui/modules/helpers/fields";
import { AccountSelectionField } from "/imports/ui/modules/accounts/common/fields";

const RowStyle = {
  height: "40px",
};
const ButtonContainerStyle = {
  paddingLeft: "20px",
};

class VoucherDetailEditForm extends Component {
  static propTypes = {
    form: PropTypes.object,

    voucherDetail: PropTypes.object,
    accountHeadsByCompanyId: PropTypes.array,
    handleCloseForm: PropTypes.func,
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
      voucherDetail,
      accountHeadsByCompanyId,
      updateVoucherDetail,
    } = this.props;
    form.validateFields(
      (err, { accountNumber, creditAmount, debitAmount, description }) => {
        if (err) return;

        const accountHead = find(accountHeadsByCompanyId, {
          number: accountNumber,
        });
        updateVoucherDetail({
          variables: {
            _id: voucherDetail._id,
            companyId: voucherDetail.companyId,
            voucherId: voucherDetail.voucherId,
            accountHeadId: accountHead._id,
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
    const { form, voucherDetail, accountHeadsByCompanyId } = this.props;
    const { getFieldDecorator } = form;

    const accountHead = find(accountHeadsByCompanyId, {
      _id: voucherDetail.accountHeadId,
    });

    return (
      <Row type="flex" justify="start" style={RowStyle}>
        <Col style={{ width: "280px" }}>
          <AccountSelectionField
            data={accountHeadsByCompanyId}
            fieldName="accountNumber"
            fieldLayout={null}
            placeholder="Select Account"
            initialValue={accountHead.number}
            showSearch
            required
            requiredMessage="Please select an account."
            getFieldDecorator={getFieldDecorator}
          />
        </Col>
        <Col style={{ width: "280px" }}>
          <InputTextField
            fieldName="description"
            placeholder="Description"
            initialValue={voucherDetail.description}
            fieldLayout={null}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />
        </Col>
        <Col>
          <InputNumberField
            fieldName="creditAmount"
            placeholder="Credit"
            initialValue={voucherDetail.isCredit ? voucherDetail.amount : 0}
            fieldLayout={null}
            minValue={0}
            getFieldDecorator={getFieldDecorator}
          />
        </Col>
        <Col>
          <InputNumberField
            fieldName="debitAmount"
            placeholder="Debit"
            initialValue={voucherDetail.isCredit ? 0 : voucherDetail.amount}
            fieldLayout={null}
            minValue={0}
            getFieldDecorator={getFieldDecorator}
          />
        </Col>

        <Form.Item style={ButtonContainerStyle}>
          <Button type="primary" onClick={this.handleSubmit}>
            Update
          </Button>
          <Button type="secondary" onClick={this.handleCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Row>
    );
  }
}

const formMutation = gql`
  mutation updateVoucherDetail(
    $_id: String!
    $companyId: String!
    $voucherId: String!
    $accountHeadId: String!
    $description: String
    $amount: Float!
    $isCredit: Boolean!
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

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: "updateVoucherDetail",
    options: {
      refetchQueries: ["voucherDetailsByVoucherId", "pagedVoucherDetails"],
    },
  })
)(VoucherDetailEditForm);
