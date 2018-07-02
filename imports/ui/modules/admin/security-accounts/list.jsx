import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Icon, Table } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    allKarkunsWithAccounts: PropTypes.array,
    deleteAccount: PropTypes.func,
  };

  columns = [
    {
      title: 'Karkun name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`${paths.accountsPath}/${record._id}`}>{text}</Link>,
    },
    {
      title: 'CNIC number',
      dataIndex: 'cnicNumber',
      key: 'cnicNumber',
    },
    {
      title: 'User name',
      dataIndex: 'user.username',
      key: 'username',
    },
    {
      key: 'action',
      render: (text, record) => (
        <span>
          <a href="javascript:;">
            <Icon
              type="delete"
              style={{ fontSize: 20 }}
              onClick={() => {
                this.handleDeleteClicked(record);
              }}
            />
          </a>
        </span>
      ),
    },
  ];

  handleNewClicked = () => {
    const { history } = this.props;
    history.push(paths.accountsNewFormPath);
  };

  handleDeleteClicked = record => {
    const { deleteAccount } = this.props;
    deleteAccount({
      variables: {
        karkunId: record.karkun._id,
        karkunUserId: record._id,
      },
    }).catch(error => {
      console.log(error);
    });
  };

  render() {
    const { allKarkunsWithAccounts } = this.props;

    return (
      <Table
        rowKey="_id"
        dataSource={allKarkunsWithAccounts}
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

const formMutation = gql`
  mutation deleteAccount($karkunId: String!, $karkunUserId: String!) {
    deleteAccount(karkunId: $karkunId, karkunUserId: $karkunUserId)
  }
`;

const listQuery = gql`
  query allKarkunsWithAccounts {
    allKarkunsWithAccounts {
      _id
      name
      cnicNumber
      user {
        _id
        username
      }
    }
  }
`;

export default merge(
  graphql(formMutation, {
    name: 'deleteAccount',
    options: {
      refetchQueries: ['allkarkunsWithAccounts'],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Accounts', 'List'])
)(List);
