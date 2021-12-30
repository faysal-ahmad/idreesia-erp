import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import gql from "graphql-tag";
import { flowRight } from "lodash";
import { graphql } from "react-apollo";

import { Formats } from "meteor/idreesia-common/constants";
import { Pagination, Table } from "antd";

class List extends Component {
  static propTypes = {
    pageIndex: PropTypes.number,
    pageSize: PropTypes.number,
    companyId: PropTypes.string,
    accountHeadIds: PropTypes.array,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    includeCredits: PropTypes.bool,
    includeDebits: PropTypes.bool,
    setPageParams: PropTypes.func,

    loading: PropTypes.bool,
    pagedVoucherDetails: PropTypes.shape({
      totalResults: PropTypes.number,
      data: PropTypes.array,
    }),
  };

  dateColumn = {
    title: "Date",
    dataIndex: ['refVoucher', 'voucherDate'],
    key: "refVoucher.voucherDate",
    render: text => {
      const date = moment(Number(text));
      return date.format("DD MMM, YYYY");
    },
  };

  descriptionColumn = {
    title: "Description",
    dataIndex: ['refVoucher' ,'description'],
    key: "refVoucher.description",
  };

  accountHeadColumn = {
    title: "Account Head",
    key: "accountHead",
    render: (text, record) =>
      `[${record.refAccountHead.number}] ${record.refAccountHead.name}`,
  };

  creditColumn = {
    title: "Credit",
    key: "credit",
    render: (text, record) => {
      const { amount, isCredit } = record;
      return isCredit ? amount : "";
    },
  };

  debitColumn = {
    title: "Debit",
    key: "debit",
    render: (text, record) => {
      const { amount, isCredit } = record;
      return isCredit ? "" : amount;
    },
  };

  getColumns = () => [
    this.dateColumn,
    this.descriptionColumn,
    this.accountHeadColumn,
    this.creditColumn,
    this.debitColumn,
  ];

  onChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  onShowSizeChange = (pageIndex, pageSize) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: pageIndex - 1,
      pageSize,
    });
  };

  render() {
    const { loading } = this.props;
    if (loading) return null;

    const {
      pageIndex,
      pageSize,
      pagedVoucherDetails: { totalResults, data },
    } = this.props;

    const numPageIndex = pageIndex ? pageIndex + 1 : 1;
    const numPageSize = pageSize || 20;

    return (
      <Table
        rowKey="_id"
        dataSource={data}
        columns={this.getColumns()}
        bordered
        size="small"
        pagination={false}
        footer={() => (
          <Pagination
            current={numPageIndex}
            pageSize={numPageSize}
            showSizeChanger
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            onChange={this.onChange}
            onShowSizeChange={this.onShowSizeChange}
            total={totalResults}
          />
        )}
      />
    );
  }
}

const listQuery = gql`
  query pagedVoucherDetails(
    $companyId: String!
    $accountHeadIds: [String]!
    $startDate: String!
    $endDate: String!
    $includeCredits: Boolean!
    $includeDebits: Boolean!
    $pageIndex: Float!
    $pageSize: Float!
  ) {
    pagedVoucherDetails(
      companyId: $companyId
      accountHeadIds: $accountHeadIds
      startDate: $startDate
      endDate: $endDate
      includeCredits: $includeCredits
      includeDebits: $includeDebits
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        accountHeadId
        amount
        isCredit
        refAccountHead {
          _id
          name
          number
        }
        refVoucher {
          _id
          voucherDate
          description
        }
      }
    }
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({
      companyId,
      accountHeadIds,
      startDate,
      endDate,
      includeCredits,
      includeDebits,
      pageIndex,
      pageSize,
    }) => ({
      variables: {
        companyId,
        accountHeadIds,
        startDate: startDate.format(Formats.DATE_FORMAT),
        endDate: endDate.format(Formats.DATE_FORMAT),
        includeCredits,
        includeDebits,
        pageIndex,
        pageSize,
      },
    }),
  })
)(List);
