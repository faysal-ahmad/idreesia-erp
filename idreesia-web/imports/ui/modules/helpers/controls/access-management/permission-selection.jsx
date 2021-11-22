import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { filter } from 'meteor/idreesia-common/utilities/lodash';
import { Tree } from 'antd';
import { allModulePermissions } from './all-module-permissions';

export default class PermissionSelection extends Component {
  static propTypes = {
    permissions: PropTypes.array,
    securityEntity: PropTypes.object,
  };

  static defaultProps = {
    permissions: allModulePermissions,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { securityEntity } = nextProps;
    if (securityEntity && !prevState.initDone) {
      return {
        initDone: true,
        checkedKeys: securityEntity.permissions,
      };
    }

    return null;
  }

  state = {
    initDone: false,
    expandedKeys: [],
    checkedKeys: [],
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

  getSelectedPermissions = () => {
    const { checkedKeys } = this.state;
    const permissions = filter(checkedKeys, key => !key.startsWith('module-'));
    return permissions;
  };

  render() {
    const { permissions } = this.props;
    return (
      <Tree
        checkable
        onExpand={this.onExpand}
        expandedKeys={this.state.expandedKeys}
        autoExpandParent={this.state.autoExpandParent}
        onCheck={this.onCheck}
        checkedKeys={this.state.checkedKeys}
      >
        {this.renderTreeNodes(permissions)}
      </Tree>
    );
  }
}
