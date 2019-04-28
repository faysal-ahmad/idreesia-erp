import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";
import { Button, Row, Tree, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import { filter } from "lodash";

import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";
import { AdminSubModulePaths as paths } from "/imports/ui/modules/admin";

const permissionsData = [
  {
    title: "Admin",
    key: "module-admin",
    children: [
      {
        title: "Security Accounts",
        key: "module-admin-security-accounts",
        children: [
          {
            title: "View Accounts",
            key: PermissionConstants.ADMIN_VIEW_ACCOUNTS,
          },
          {
            title: "Manage Accounts",
            key: PermissionConstants.ADMIN_MANAGE_ACCOUNTS,
          },
        ],
      },
      {
        title: "Physical Stores",
        key: "module-admin-physical-stores",
        children: [
          {
            title: "View Physical Stores",
            key: PermissionConstants.ADMIN_VIEW_PHYSICAL_STORES,
          },
          {
            title: "Manage Physical Stores",
            key: PermissionConstants.ADMIN_MANAGE_PHYSICAL_STORES,
          },
        ],
      },
      {
        title: "Accounts",
        key: "module-admin-companies",
        children: [
          {
            title: "View Companies",
            key: PermissionConstants.ADMIN_VIEW_COMPANIES,
          },
          {
            title: "Manage Companies",
            key: PermissionConstants.ADMIN_MANAGE_COMPANIES,
          },
        ],
      },
    ],
  },
  {
    title: "Accounts",
    key: "module-accounts",
    children: [
      {
        title: "Account Heads",
        key: "module-accounts-account-heads",
        children: [
          {
            title: "View Account Heads",
            key: PermissionConstants.ACCOUNTS_VIEW_ACCOUNT_HEADS,
          },
          {
            title: "Manage Account Heads",
            key: PermissionConstants.ACCOUNTS_ACCOUNT_HEADS,
          },
        ],
      },
      {
        title: "View Activity Sheet",
        key: PermissionConstants.ACCOUNTS_VIEW_ACTIVTY_SHEET,
      },
      {
        title: "Vouchers",
        key: "module-accounts-vouchers",
        children: [
          {
            title: "View Vouchers",
            key: PermissionConstants.ACCOUNTS_VIEW_VOUCHERS,
          },
          {
            title: "Manage Vouchers",
            key: PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
          },
        ],
      },
      {
        title: "Amaanat Logs",
        key: "module-accounts-amaanat-logs",
        children: [
          {
            title: "View Amaanat Logs",
            key: PermissionConstants.ACCOUNTS_VIEW_AMAANAT_LOGS,
          },
          {
            title: "Manage Amaanat Logs",
            key: PermissionConstants.ACCOUNTS_MANAGE_AMAANAT_LOGS,
          },
        ],
      },
    ],
  },
  {
    title: "HR",
    key: "module-hr",
    children: [
      {
        title: "Manage Setup Data",
        key: PermissionConstants.HR_MANAGE_SETUP_DATA,
      },
      {
        title: "Karkuns",
        key: "module-hr-karkuns",
        children: [
          {
            title: "View Karkuns",
            key: PermissionConstants.HR_VIEW_KARKUNS,
          },
          {
            title: "Manage Karkuns",
            key: PermissionConstants.HR_MANAGE_KARKUNS,
          },
        ],
      },
      {
        title: "Attendance Sheets",
        key: "module-hr-attendance-sheets",
        children: [
          {
            title: "View Attendance Sheets",
            key: PermissionConstants.HR_VIEW_ATTENDANCES,
          },
          {
            title: "Manage Attendance Sheets",
            key: PermissionConstants.HR_MANAGE_ATTENDANCES,
          },
        ],
      },
    ],
  },
  {
    title: "Inventory",
    key: "module-inventory",
    children: [
      {
        title: "Manage Setup Data",
        key: PermissionConstants.IN_MANAGE_SETUP_DATA,
      },
      {
        title: "Stock Items",
        key: "module-inventory-stock-items",
        children: [
          {
            title: "View Stock Items",
            key: PermissionConstants.IN_VIEW_STOCK_ITEMS,
          },
          {
            title: "Manage Stock Items",
            key: PermissionConstants.IN_MANAGE_STOCK_ITEMS,
          },
        ],
      },
      {
        title: "Issuance Forms",
        key: "module-inventory-issuance-forms",
        children: [
          {
            title: "View Issuance Forms",
            key: PermissionConstants.IN_VIEW_ISSUANCE_FORMS,
          },
          {
            title: "Manage Issuance Forms",
            key: PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          },
          {
            title: "Approve Issuance Forms",
            key: PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
          },
        ],
      },
      {
        title: "Purchase Forms",
        key: "module-inventory-purchase-forms",
        children: [
          {
            title: "View Purchase Forms",
            key: PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          },
          {
            title: "Manage Purchase Forms",
            key: PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          },
          {
            title: "Approve Purchase Forms",
            key: PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
          },
        ],
      },
      {
        title: "Stock Adjustments",
        key: "module-inventory-stock-adjustments",
        children: [
          {
            title: "Manage Stock Adjustments",
            key: PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          },
          {
            title: "Approve Stock Adjustments",
            key: PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
          },
        ],
      },
    ],
  },
];

class Permissions extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    karkunId: PropTypes.string,
    karkunById: PropTypes.object,
    setPermissions: PropTypes.func,
  };

  state = {
    initDone: false,
    expandedKeys: [],
    checkedKeys: [],
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { karkunById } = nextProps;
    if (karkunById && !prevState.initDone) {
      return {
        initDone: true,
        checkedKeys: karkunById.user.permissions,
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
    const permissions = filter(checkedKeys, key => !key.startsWith("module-"));

    setPermissions({
      variables: {
        karkunId: karkunById._id,
        karkunUserId: karkunById.userId,
        permissions,
      },
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
      autoExpandParent: false,
    });
  };

  onCheck = checkedKeys => {
    this.setState({ checkedKeys });
  };

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }

      return <Tree.TreeNode {...item} />;
    });

  render() {
    const { loading } = this.props;
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
          <Button type="default" onClick={this.handleCancel}>
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
  mutation setPermissions(
    $karkunId: String!
    $karkunUserId: String!
    $permissions: [String]!
  ) {
    setPermissions(
      karkunId: $karkunId
      karkunUserId: $karkunUserId
      permissions: $permissions
    ) {
      _id
      userId
      user {
        _id
        permissions
      }
    }
  }
`;

export default compose(
  graphql(formMutation, {
    name: "setPermissions",
    options: {
      refetchQueries: ["allKarkunsWithAccounts"],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ karkunId }) => ({ variables: { _id: karkunId } }),
  })
)(Permissions);
