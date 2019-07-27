import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Menu, Icon } from "antd";

import { GlobalActionsCreator } from "/imports/ui/action-creators";
import SubModuleNames from "./submodule-names";
import { default as paths } from "./submodule-paths";

const { SubMenu } = Menu;

class HRSidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
  };

  handleMenuItemSelected = ({ key }) => {
    const { history, setActiveSubModuleName } = this.props;

    switch (key) {
      case "jobs":
        setActiveSubModuleName(SubModuleNames.jobs);
        history.push(paths.jobsPath);
        break;

      case "duties":
        setActiveSubModuleName(SubModuleNames.duties);
        history.push(paths.dutiesPath);
        break;

      case "attendance-sheets":
        setActiveSubModuleName(SubModuleNames.attendanceSheets);
        history.push(paths.attendanceSheetsPath);
        break;

      case "duty-shifts":
        setActiveSubModuleName(SubModuleNames.dutyShifts);
        history.push(paths.dutyShiftsPath);
        break;

      case "duty-locations":
        setActiveSubModuleName(SubModuleNames.dutyLocations);
        history.push(paths.dutyLocationsPath);
        break;

      case "karkuns":
        setActiveSubModuleName(SubModuleNames.karkuns);
        history.push(paths.karkunsPath);
        break;

      case "karkuns-search":
        setActiveSubModuleName(SubModuleNames.karkuns);
        history.push(paths.karkunsSearchPath);
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
        onClick={this.handleMenuItemSelected}
      >
        <Menu.Item key="karkuns">Karkuns</Menu.Item>
        <Menu.Item key="attendance-sheets">Attendance Sheets</Menu.Item>
        <SubMenu
          key="setup"
          title={
            <span>
              <Icon type="laptop" />Setup
            </span>
          }
        >
          <Menu.Item key="jobs">Jobs</Menu.Item>
          <Menu.Item key="duties">Duties</Menu.Item>
          <Menu.Item key="duty-shifts">Duty Shifts</Menu.Item>
          <Menu.Item key="duty-locations">Duty Locations</Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  setActiveSubModuleName: subModuleName => {
    dispatch(GlobalActionsCreator.setActiveSubModuleName(subModuleName));
  },
});

const HRSidebarContainer = connect(null, mapDispatchToProps)(HRSidebar);
export default HRSidebarContainer;
