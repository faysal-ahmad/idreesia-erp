import React, { Component } from "react";
import PropTypes from "prop-types";
import { find, flowRight } from "lodash";
import { Button, Col, Form, Row, message } from "antd";
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

class VoucherDetailNewForm extends Component {
  static propTypes = {
    form: PropTypes.object,

    companyId: PropTypes.string,
    voucherId: PropTypes.string,
    accountHeadsByCompanyId: PropTypes.array,
    createVoucherDetail: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      companyId,
      voucherId,
      accountHeadsByCompanyId,
      createVoucherDetail,
    } = this.props;
    form.validateFields(
      (err, { accountNumber, creditAmount, debitAmount, description }) => {
        if (err) return;

        const accountHead = find(accountHeadsByCompanyId, {
          number: accountNumber,
        });
        createVoucherDetail({
          variables: {
            companyId,
            voucherId,
            accountHeadId: accountHead._id,
            amount: creditAmount || debitAmount,
            isCredit: creditAmount !== 0,
            description,
          },
        })
          .then(() => {
            form.resetFields();
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { accountHeadsByCompanyId } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Row type="flex" justify="start" style={RowStyle}>
        <Col style={{ width: "300px" }}>
          <AccountSelectionField
            data={accountHeadsByCompanyId}
            fieldName="accountNumber"
            fieldLayout={null}
            placeholder="Select Account"
            showSearch
            required
            requiredMessage="Please select an account."
            getFieldDecorator={getFieldDecorator}
          />
        </Col>
        <Col style={{ width: "300px" }}>
          <InputTextField
            fieldName="description"
            placeholder="Description"
            fieldLayout={null}
            required={false}
            getFieldDecorator={getFieldDecorator}
          />
        </Col>
        <Col>
          <InputNumberField
            fieldName="creditAmount"
            placeholder="Credit"
            fieldLayout={null}
            minValue={0}
            getFieldDecorator={getFieldDecorator}
          />
        </Col>
        <Col>
          <InputNumberField
            fieldName="debitAmount"
            placeholder="Debit"
            fieldLayout={null}
            minValue={0}
            getFieldDecorator={getFieldDecorator}
          />
        </Col>

        <Form.Item style={ButtonContainerStyle}>
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleSubmit}
          >
            Add Item
          </Button>
        </Form.Item>
      </Row>
    );
  }
}

const formMutation = gql`
  mutation createVoucherDetail(
    $companyId: String!
    $voucherId: String!
    $accountHeadId: String!
    $description: String
    $amount: Float!
    $isCredit: Boolean!
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

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: "createVoucherDetail",
    options: {
      refetchQueries: ["voucherDetailsByVoucherId", "pagedVoucherDetails"],
    },
  })
)(VoucherDetailNewForm);
