import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Icon, Menu } from "antd";

import { GlobalActionsCreator } from "/imports/ui/action-creators";
import SubModuleNames from "./submodule-names";
import { default as paths } from "./submodule-paths";

class SecuritySidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
  };

  handleMenuItemSelected = ({ key }) => {
    const { history, setActiveSubModuleName } = this.props;

    switch (key) {
      case "karkun-verification":
        setActiveSubModuleName(SubModuleNames.karkunVerification);
        history.push(paths.karkunVerificationPath);
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
        <Menu.Item key="karkun-verification">
          <span>
            <Icon type="user" />
            Karkun Verification
          </span>
        </Menu.Item>
      </Menu>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  setActiveSubModuleName: subModuleName => {
    dispatch(GlobalActionsCreator.setActiveSubModuleName(subModuleName));
  },
});

const SecuritySidebarContainer = connect(null, mapDispatchToProps)(
  SecuritySidebar
);
export default SecuritySidebarContainer;
