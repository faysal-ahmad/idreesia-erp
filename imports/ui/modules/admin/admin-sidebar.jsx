import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'antd';

import { GlobalActionsCreator } from '/imports/ui/action-creators';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const { SubMenu } = Menu;

class AdminSidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func
  };

  handleMenuItemSelected = ({ item, key, selectedKeys }) => {
    const { history, setActiveSubModuleName } = this.props;

    switch (key) {
      case 'accounts':
        setActiveSubModuleName(SubModuleNames.accounts);
        history.push(paths.accountsPath);
        break;

      case 'profiles':
        setActiveSubModuleName(SubModuleNames.profiles);
        history.push(paths.profilesPath);
        break;

      case 'departments':
        setActiveSubModuleName(SubModuleNames.departments);
        history.push(paths.departmentsPath);
        break;

      default:
        break;
    }
  };

  render() {
    return (
      <Menu
        mode="inline"
        defaultSelectedKeys={['home']}
        style={{ height: '100%', borderRight: 0 }}
        onSelect={this.handleMenuItemSelected}
      >
        <SubMenu
          key="setup"
          title={
            <span>
              <Icon type="laptop" />Setup
            </span>
          }
        >
          <Menu.Item key="accounts">Accounts</Menu.Item>
          <Menu.Item key="profiles">Profiles</Menu.Item>
          <Menu.Item key="departments">Departments</Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}

const mapStateToProps = state => {
  return {
    activeModuleName: state.activeModuleName
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setActiveSubModuleName: subModuleName => {
      dispatch(GlobalActionsCreator.setActiveSubModuleName(subModuleName));
    }
  };
};

const AdminSidebarContainer = connect(null, mapDispatchToProps)(AdminSidebar);
export default AdminSidebarContainer;
