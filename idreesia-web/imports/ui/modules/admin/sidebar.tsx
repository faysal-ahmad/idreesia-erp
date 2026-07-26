// @ts-nocheck
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const menuItems = [
  {
    key: 'access',
    label: 'Access Management',
    children: [
      { key: 'users', label: 'Users' },
      { key: 'user-groups', label: 'User Groups' },
    ],
  },
  {
    key: 'instances',
    label: 'Instance Management',
    children: [{ key: 'physical-stores', label: 'Physical Stores' }],
  },
  {
    key: 'locations',
    label: 'Locations Management',
    children: [{ key: 'cities', label: 'Cities & Mehfils' }],
  },
];

class Sidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
  };

  handleMenuItemSelected = ({ key }) => {
    const { history, setActiveSubModuleName } = this.props;

    switch (key) {
      case 'users':
        setActiveSubModuleName(SubModuleNames.users);
        history.push(paths.usersPath);
        break;

      case 'user-groups':
        setActiveSubModuleName(SubModuleNames.userGroups);
        history.push(paths.userGroupsPath);
        break;

      case 'physical-stores':
        setActiveSubModuleName(SubModuleNames.physicalStores);
        history.push(paths.physicalStoresPath);
        break;

      case 'cities':
        setActiveSubModuleName(SubModuleNames.cities);
        history.push(paths.citiesPath);
        break;

      default:
        break;
    }
  };

  render() {
    return (
      <Menu
        mode="inline"
        style={{ height: '100%', borderRight: 0 }}
        onClick={this.handleMenuItemSelected}
        items={menuItems}
      />
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar);
export default SidebarContainer;
