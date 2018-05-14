import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Table } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allAccounts: PropTypes.array
  };

  columns = [
    {
      title: 'Karkun name',
      dataIndex: 'karkun.name',
      key: 'karkunName',
      render: (text, record) => <Link to={`${paths.accountsPath}/${record._id}`}>{text}</Link>
    },
    {
      title: 'User name',
      dataIndex: 'username',
      key: 'username'
    }
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.accountsNewFormPath);
  };

  render() {
    const { allAccounts } = this.props;

    return (
      <Table
        rowKey={'_id'}
        dataSource={allAccounts}
        columns={this.columns}
        bordered
        title={() => {
          return (
            <Button type="primary" icon="plus-circle-o" onClick={this.handleNewClicked}>
              New Account
            </Button>
          );
        }}
      />
    );
  }
}

const listQuery = gql`
  query allAccounts {
    allAccounts {
      _id
      username
      karkun {
        _id
        name
      }
    }
  }
`;

export default merge(
  graphql(listQuery, {
    props: ({ data }) => ({ ...data })
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Accounts', 'List'])
)(List);
