import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { Formats } from 'meteor/idreesia-common/constants';
import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Table } from '/imports/ui/controls';

class SalarySheets extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    salariesByKarkun: PropTypes.array,
  };

  columns = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      render: text => {
        const date = moment(`01-${text}`, Formats.DATE_FORMAT);
        return date.format('MMM, YYYY');
      },
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
    },
    {
      title: 'Loan',
      children: [
        {
          title: 'Opening',
          dataIndex: 'openingLoan',
          key: 'openingLoan',
        },
        {
          title: 'Deduction',
          dataIndex: 'loanDeduction',
          key: 'loanDeduction',
        },
        {
          title: 'New',
          dataIndex: 'newLoan',
          key: 'newLoan',
        },
        {
          title: 'Closing',
          dataIndex: 'closingLoan',
          key: 'closingLoan',
        },
      ],
    },
    {
      title: 'Other Deduction',
      dataIndex: 'otherDeduction',
      key: 'otherDeduction',
    },
    {
      title: 'Arrears',
      dataIndex: 'arrears',
      key: 'arrears',
    },
    {
      title: 'Net Payment',
      dataIndex: 'netPayment',
      key: 'netPayment',
    },
  ];

  render() {
    const { salariesByKarkun, loading } = this.props;
    if (loading) return null;

    return (
      <Table
        rowKey="_id"
        size="small"
        columns={this.columns}
        dataSource={salariesByKarkun}
        pagination={false}
        bordered
      />
    );
  }
}

const listQuery = gql`
  query salariesByKarkun($karkunId: String!) {
    salariesByKarkun(karkunId: $karkunId) {
      _id
      month
      salary
      openingLoan
      loanDeduction
      newLoan
      closingLoan
      otherDeduction
      arrears
      netPayment
    }
  }
`;

export default flowRight(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { karkunId } };
    },
  })
)(SalarySheets);
