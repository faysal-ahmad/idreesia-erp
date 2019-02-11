import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Menu, Icon } from "antd";

import { GlobalActionsCreator } from "/imports/ui/action-creators";
import SubModuleNames from "./submodule-names";
import { default as paths } from "./submodule-paths";

class AdminSidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
  };

  handleMenuItemSelected = ({ key }) => {
    const { history, setActiveSubModuleName } = this.props;

    switch (key) {
      case "accounts":
        setActiveSubModuleName(SubModuleNames.accounts);
        history.push(paths.accountsPath);
        break;

      case "physical-stores":
        setActiveSubModuleName(SubModuleNames.physicalStores);
        history.push(paths.physicalStoresPath);
        break;

      case "companies":
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
        defaultSelectedKeys={["home"]}
        style={{ height: "100%", borderRight: 0 }}
        onSelect={this.handleMenuItemSelected}
      >
        <Menu.SubMenu
          key="setup"
          title={
            <span>
              <Icon type="laptop" />Setup
            </span>
          }
        >
          <Menu.Item key="accounts">Security Accounts</Menu.Item>
          <Menu.Item key="physical-stores">Physical Stores</Menu.Item>
          <Menu.Item key="companies">Companies</Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  setActiveSubModuleName: subModuleName => {
    dispatch(GlobalActionsCreator.setActiveSubModuleName(subModuleName));
  },
});

const AdminSidebarContainer = connect(null, mapDispatchToProps)(AdminSidebar);
export default AdminSidebarContainer;
