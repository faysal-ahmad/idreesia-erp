import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  Button,
  Icon,
  Popconfirm,
  Table,
  Tooltip,
  message,
} from '/imports/ui/controls';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

const IconStyle = {
  cursor: 'pointer',
  fontSize: 20,
};

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
      render: (text, record) => (
        <Link to={`${paths.accountsPath}/${record._id}`}>{text}</Link>
      ),
    },
    {
      title: 'User name',
      dataIndex: 'user.username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'user.email',
      key: 'user.email',
    },
    {
      key: 'action',
      render: (text, record) => (
        <Popconfirm
          title="Are you sure you want to delete this account?"
          onConfirm={() => {
            this.handleDeleteClicked(record);
          }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="Delete">
            <Icon type="delete" style={IconStyle} />
          </Tooltip>
        </Popconfirm>
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
        karkunId: record._id,
        karkunUserId: record.user._id,
      },
    }).catch(error => {
      message.error(error.message, 5);
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
          <Button
            type="primary"
            icon="plus-circle-o"
            onClick={this.handleNewClicked}
          >
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
      user {
        _id
        username
        email
      }
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'deleteAccount',
    options: {
      refetchQueries: ['allKarkunsWithAccounts'],
    },
  }),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Accounts', 'List'])
)(List);