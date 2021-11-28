import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Col, Form, Row, message } from "antd";
import { find, flowRight } from "lodash";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

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
    voucherDetail: PropTypes.object,
    accountHeadsByCompanyId: PropTypes.array,
    handleCloseForm: PropTypes.func,
    updateVoucherDetail: PropTypes.func,
  };

  handleCancel = () => {
    const { handleCloseForm } = this.props;
    handleCloseForm();
  };

  handleFinish = ({ accountNumber, creditAmount, debitAmount, description }) => {
    const {
      handleCloseForm,
      voucherDetail,
      accountHeadsByCompanyId,
      updateVoucherDetail,
    } = this.props;
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
  };

  render() {
    const { voucherDetail, accountHeadsByCompanyId } = this.props;

    const accountHead = find(accountHeadsByCompanyId, {
      _id: voucherDetail.accountHeadId,
    });

    return (
      <Form onFinish={this.handleFinish}>
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
            />
          </Col>
          <Col style={{ width: "280px" }}>
            <InputTextField
              fieldName="description"
              placeholder="Description"
              initialValue={voucherDetail.description}
              fieldLayout={null}
              required={false}
            />
          </Col>
          <Col>
            <InputNumberField
              fieldName="creditAmount"
              placeholder="Credit"
              initialValue={voucherDetail.isCredit ? voucherDetail.amount : 0}
              fieldLayout={null}
              minValue={0}
            />
          </Col>
          <Col>
            <InputNumberField
              fieldName="debitAmount"
              placeholder="Debit"
              initialValue={voucherDetail.isCredit ? 0 : voucherDetail.amount}
              fieldLayout={null}
              minValue={0}
            />
          </Col>

          <Form.Item style={ButtonContainerStyle}>
            <Button type="primary" htmlType="submit">
              Update
            </Button>
            <Button type="secondary" onClick={this.handleCancel}>
              Cancel
            </Button>
          </Form.Item>
        </Row>
      </Form>
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
  graphql(formMutation, {
    name: "updateVoucherDetail",
    options: {
      refetchQueries: ["voucherDetailsByVoucherId", "pagedVoucherDetails"],
    },
  })
)(VoucherDetailEditForm);
