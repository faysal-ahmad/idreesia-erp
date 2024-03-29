import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

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
      case 'admin-jobs':
        setActiveSubModuleName(SubModuleNames.adminJobs);
        history.push(paths.adminJobsPath);
        break;

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

      case 'companies':
        setActiveSubModuleName(SubModuleNames.companies);
        history.push(paths.companiesPath);
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
      >
        <Menu.Item key="admin-jobs">Admin Jobs</Menu.Item>
        <Menu.SubMenu key="access" title={<span>Access Management </span>}>
          <Menu.Item key="users">Users</Menu.Item>
          <Menu.Item key="user-groups">User Groups</Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu key="instances" title={<span>Instance Management</span>}>
          <Menu.Item key="companies">Companies</Menu.Item>
          <Menu.Item key="physical-stores">Physical Stores</Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar);
export default SidebarContainer;
