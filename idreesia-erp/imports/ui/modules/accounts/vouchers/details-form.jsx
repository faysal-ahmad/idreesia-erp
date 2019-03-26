import React, { Component } from "react";
import PropTypes from "prop-types";
import { Table } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

class DetailsForm extends Component {
  static propTypes = {
    companyId: PropTypes.string,
    voucherId: PropTypes.string,
    voucherDetailsByVoucherId: PropTypes.array,
    loading: PropTypes.bool,
  };

  columns = [
    {
      title: "Account Head",
      key: "accountHead",
      render: (text, record) => {
        const { refAccountHead } = record;
        return `${refAccountHead.name} [${refAccountHead.number}]`;
      },
    },
    {
      title: "Credit",
      key: "credit",
      render: (text, record) => {
        const { amount, isCredit } = record;
        return isCredit ? amount : "";
      },
    },
    {
      title: "Debit",
      key: "debit",
      render: (text, record) => {
        const { amount, isCredit } = record;
        return isCredit ? "" : amount;
      },
    },
  ];

  render() {
    const { loading, voucherDetailsByVoucherId } = this.props;
    if (loading) return null;

    return (
      <Table
        rowKey="_id"
        dataSource={voucherDetailsByVoucherId}
        columns={this.columns}
        bordered
        size="small"
        pagination={false}
      />
    );
  }
}

const listQuery = gql`
  query voucherDetailsByVoucherId($companyId: String!, $voucherId: String!) {
    voucherDetailsByVoucherId(companyId: $companyId, voucherId: $voucherId) {
      _id
      companyId
      accountHeadId
      amount
      isCredit
      refAccountHead {
        _id
        name
        number
      }
    }
  }
`;

export default compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ companyId, voucherId }) => ({
      variables: {
        companyId,
        voucherId,
      },
    }),
  })
)(DetailsForm);
