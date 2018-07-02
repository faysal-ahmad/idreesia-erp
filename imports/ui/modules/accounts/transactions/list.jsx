import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Table } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allFinancialAccounts: PropTypes.array,
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`${paths.financialAccountsPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: 'Starting Balance',
      dataIndex: 'startingBalance',
      key: 'startingBalance',
    },
    {
      title: 'Current Balance',
      dataIndex: 'currentBalance',
      key: 'currentBalance',
    },
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.financialAccountsNewFormPath);
  };

  render() {
    const { allFinancialAccounts } = this.props;
    return (
      <Table
        rowKey="_id"
        dataSource={allFinancialAccounts}
        columns={this.columns}
        bordered
        title={() => (
          <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
            New Account
          </Button>
        )}
      />
    );
  }
}

const listQuery = gql`
  query allFinancialAccounts {
    allFinancialAccounts {
      _id
      name
      startingBalance
      currentBalance
    }
  }
`;

export default compose(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Financial Accounts', 'List'])
)(List);
