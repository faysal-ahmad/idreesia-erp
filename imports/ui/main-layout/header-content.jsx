import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Layout, Menu } from 'antd';
import { keys, forEach } from 'lodash';

import { ModuleNames, ModulePaths } from '../constants';
import { GlobalActionsCreator } from '../action-creators';

const { Header } = Layout;

const modulePathsMapping = {};
modulePathsMapping[ModuleNames.admin] = ModulePaths.admin;
modulePathsMapping[ModuleNames.inventory] = ModulePaths.inventory;
modulePathsMapping[ModuleNames.accounts] = ModulePaths.accounts;
modulePathsMapping[ModuleNames.hr] = ModulePaths.hr;

class HeaderContent extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    setActiveModuleName: PropTypes.func
  };

  handleMenuItemSelected = ({ item, key, selectedKeys }) => {
    const moduleName = item.props.children;
    const modulePath = modulePathsMapping[moduleName];
    const { history, setActiveModuleName } = this.props;
    history.push(modulePath);
    setActiveModuleName(moduleName);
  };

  componentWillMount() {
    // We need to set the active module on initial mount
    const { location, setActiveModuleName } = this.props;
    const { pathname } = location;

    if (pathname !== '/') {
      const moduleNames = keys(modulePathsMapping);
      forEach(moduleNames, moduleName => {
        const modulePath = modulePathsMapping[moduleName];
        if (pathname.startsWith(modulePath)) {
          setActiveModuleName(moduleName);
        }
      });
    }
  }

  render() {
    const menuItems = [];
    const selectedMenuItemKey = [];
    const { pathname } = this.props.location;

    const moduleNames = keys(modulePathsMapping);
    moduleNames.forEach((moduleName, index) => {
      const modulePath = modulePathsMapping[moduleName];
      menuItems.push(<Menu.Item key={index.toString()}>{moduleName}</Menu.Item>);
      if (pathname.startsWith(modulePath)) {
        selectedMenuItemKey.push(index.toString());
      }
    });

    return (
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={selectedMenuItemKey}
          style={{ lineHeight: '64px' }}
          onSelect={this.handleMenuItemSelected}
        >
          {menuItems}
        </Menu>
      </Header>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setActiveModuleName: moduleName => {
      dispatch(GlobalActionsCreator.setActiveModuleName(moduleName));
    }
  };
};

const HeaderContentContainer = connect(null, mapDispatchToProps)(HeaderContent);
export default HeaderContentContainer;
