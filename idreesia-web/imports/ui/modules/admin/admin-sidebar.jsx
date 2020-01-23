import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu } from '/imports/ui/controls';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

class AdminSidebar extends Component {
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

      case 'security-accounts':
        setActiveSubModuleName(SubModuleNames.accounts);
        history.push(paths.accountsPath);
        break;

      case 'security-groups':
        setActiveSubModuleName(SubModuleNames.groups);
        history.push(paths.groupsPath);
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
          <Menu.Item key="security-groups">Security Groups</Menu.Item>
          <Menu.Item key="security-accounts">Security Accounts</Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu key="instances" title={<span>Instance Management</span>}>
          <Menu.Item key="companies">Companies</Menu.Item>
          <Menu.Item key="physical-stores">Physical Stores</Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

const AdminSidebarContainer = WithActiveModule()(AdminSidebar);
export default AdminSidebarContainer;
