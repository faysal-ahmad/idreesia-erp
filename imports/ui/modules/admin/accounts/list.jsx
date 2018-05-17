import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Divider, Icon, Table } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allAccounts: PropTypes.array,
    deleteAccount: PropTypes.func
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
    },
    {
      key: 'action',
      render: (text, record) => (
        <span>
          <a href="javascript:;">
            <Icon
              type="edit"
              onClick={() => {
                this.handleEditClicked(record);
              }}
            />
          </a>
          <Divider type="vertical" />
          <a href="javascript:;">
            <Icon
              type="delete"
              onClick={() => {
                this.handleDeleteClicked(record);
              }}
            />
          </a>
        </span>
      )
    }
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.accountsNewFormPath);
  };

  handleEditClicked = record => {};

  handleDeleteClicked = record => {
    const { deleteAccount } = this.props;
    debugger;
    deleteAccount({
      variables: {
        karkunId: record.karkun._id,
        karkunUserId: record._id
      }
    }).catch(error => {
      console.log(error);
    });
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

const formMutation = gql`
  mutation deleteAccount($karkunId: String!, $karkunUserId: String!) {
    deleteAccount(karkunId: $karkunId, karkunUserId: $karkunUserId)
  }
`;

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
  graphql(formMutation, {
    name: 'deleteAccount',
    options: {
      refetchQueries: ['allAccounts']
    }
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data })
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Accounts', 'List'])
)(List);
