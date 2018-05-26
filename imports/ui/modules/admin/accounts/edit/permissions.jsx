import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Row, Tree, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { filter } from 'lodash';

import { Permissions as PermissionConstants } from '/imports/lib/constants';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel
} from '/imports/ui/modules/helpers/fields';

const permissionsData = [
  {
    title: 'Admin',
    key: 'module-admin',
    children: [
      {
        title: 'View Accounts',
        key: PermissionConstants.ADMIN_VIEW_ACCOUNTS
      },
      {
        title: 'Manage Accounts',
        key: PermissionConstants.ADMIN_MANAGE_ACCOUNTS
      }
    ]
  },
  {
    title: 'HR',
    key: 'module-hr',
    children: [
      {
        title: 'Manage Setup Data',
        key: PermissionConstants.HR_MANAGE_SETUP_DATA
      },
      {
        title: 'View Karkuns',
        key: PermissionConstants.HR_VIEW_KARKUNS
      },
      {
        title: 'Manage Karkuns',
        key: PermissionConstants.HR_MANAGE_KARKUNS
      }
    ]
  },
  {
    title: 'Inventory',
    key: 'module-inventory',
    children: [
      {
        title: 'Manage Setup Data',
        key: PermissionConstants.IN_MANAGE_SETUP_DATA
      },
      {
        title: 'View Stock Items',
        key: PermissionConstants.IN_VIEW_STOCK_ITEMS
      },
      {
        title: 'Manage Stock Items',
        key: PermissionConstants.IN_MANAGE_STOCK_ITEMS
      },
      {
        title: 'Approve Stock Modifications',
        key: PermissionConstants.IN_APPROVE_STOCK_MODIFICATIONS
      }
    ]
  }
];

class Permissions extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    karkunId: PropTypes.string,
    karkunById: PropTypes.object,
    setPermissions: PropTypes.func
  };

  state = {
    initDone: false,
    expandedKeys: [],
    checkedKeys: []
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { karkunById } = nextProps;
    if (karkunById && !prevState.initDone) {
      return {
        initDone: true,
        checkedKeys: karkunById.user.permissions
      };
    }

    return null;
  }

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.accountsPath);
  };

  handleSave = e => {
    e.preventDefault();
    const { history, karkunById, setPermissions } = this.props;
    const { checkedKeys } = this.state;
    const permissions = filter(checkedKeys, key => {
      return !key.startsWith('module-');
    });

    setPermissions({
      variables: {
        karkunId: karkunById._id,
        karkunUserId: karkunById.userId,
        permissions
      }
    })
      .then(() => {
        history.push(paths.accountsPath);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false
    });
  };

  onCheck = checkedKeys => {
    this.setState({ checkedKeys });
  };

  renderTreeNodes = data => {
    return data.map(item => {
      if (item.children) {
        return (
          <Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }

      return <Tree.TreeNode {...item} />;
    });
  };

  render() {
    const { loading, karkunById } = this.props;
    if (loading) return null;

    return (
      <Fragment>
        <Tree
          checkable
          onExpand={this.onExpand}
          expandedKeys={this.state.expandedKeys}
          autoExpandParent={this.state.autoExpandParent}
          onCheck={this.onCheck}
          checkedKeys={this.state.checkedKeys}
        >
          {this.renderTreeNodes(permissionsData)}
        </Tree>
        <br />
        <br />
        <Row type="flex" justify="start">
          <Button type="secondary" onClick={this.handleCancel}>
            Cancel
          </Button>
          &nbsp;
          <Button type="primary" onClick={this.handleSave}>
            Save
          </Button>
        </Row>
      </Fragment>
    );
  }
}

const formQuery = gql`
  query karkunById($_id: String!) {
    karkunById(_id: $_id) {
      _id
      userId
      user {
        _id
        permissions
      }
    }
  }
`;

const formMutation = gql`
  mutation setPermissions($karkunId: String!, $karkunUserId: String!, $permissions: [String]!) {
    setPermissions(karkunId: $karkunId, karkunUserId: $karkunUserId, permissions: $permissions) {
      _id
      userId
      user {
        _id
        permissions
      }
    }
  }
`;

export default merge(
  graphql(formMutation, {
    name: 'setPermissions',
    options: {
      refetchQueries: ['allkarkunsWithAccounts']
    }
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    }
  })
)(Permissions);
