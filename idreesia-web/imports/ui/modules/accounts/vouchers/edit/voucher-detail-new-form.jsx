import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Col, Form, Row, message } from "antd";
import { find, flowRight } from "lodash";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { PlusCircleOutlined } from '@ant-design/icons';

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
    companyId: PropTypes.string,
    voucherId: PropTypes.string,
    accountHeadsByCompanyId: PropTypes.array,
    createVoucherDetail: PropTypes.func,
  };

  formRef = React.createRef();

  handleFinish = ({ accountNumber, creditAmount, debitAmount, description }) => {
    const {
      companyId,
      voucherId,
      accountHeadsByCompanyId,
      createVoucherDetail,
    } = this.props;

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
        this.formRef.current.resetFields();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { accountHeadsByCompanyId } = this.props;

    return (
      <Form ref={this.formRef} onFinish={this.handleFinish}>
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
            />
          </Col>
          <Col style={{ width: "300px" }}>
            <InputTextField
              fieldName="description"
              placeholder="Description"
              fieldLayout={null}
              required={false}
            />
          </Col>
          <Col>
            <InputNumberField
              fieldName="creditAmount"
              placeholder="Credit"
              fieldLayout={null}
              minValue={0}
            />
          </Col>
          <Col>
            <InputNumberField
              fieldName="debitAmount"
              placeholder="Debit"
              fieldLayout={null}
              minValue={0}
            />
          </Col>

          <Form.Item style={ButtonContainerStyle}>
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              htmlType="submit"
            >
              Add Item
            </Button>
          </Form.Item>
        </Row>
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
  graphql(formMutation, {
    name: "createVoucherDetail",
    options: {
      refetchQueries: ["voucherDetailsByVoucherId", "pagedVoucherDetails"],
    },
  })
)(VoucherDetailNewForm);
