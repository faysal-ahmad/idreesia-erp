import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  AuditOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  LaptopOutlined,
  SolutionOutlined,
  TagOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const { SubMenu } = Menu;

const IconStyle = {
  fontSize: '20px',
};

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
      case 'jobs':
        setActiveSubModuleName(SubModuleNames.jobs);
        history.push(paths.jobsPath);
        break;

      case 'ms-duties':
        setActiveSubModuleName(SubModuleNames.msDuties);
        history.push(paths.msDutiesPath);
        break;

      case 'attendance-sheets':
        setActiveSubModuleName(SubModuleNames.attendanceSheets);
        history.push(paths.attendanceSheetsPath);
        break;

      case 'salary-sheets':
        setActiveSubModuleName(SubModuleNames.salarySheets);
        history.push(paths.salarySheetsPath);
        break;

      case 'duty-locations':
        setActiveSubModuleName(SubModuleNames.dutyLocations);
        history.push(paths.dutyLocationsPath);
        break;

      case 'karkuns':
        setActiveSubModuleName(SubModuleNames.karkuns);
        history.push(paths.karkunsPath);
        break;

      case 'people':
        setActiveSubModuleName(SubModuleNames.people);
        history.push(paths.peoplePath);
        break;

      case 'audit-logs':
        setActiveSubModuleName(SubModuleNames.auditLogs);
        history.push(paths.auditLogsPath);
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
        <Menu.Item key="people">
          <TeamOutlined style={IconStyle} />
          <span>People</span>
        </Menu.Item>
        <Menu.Item key="karkuns">
          <TeamOutlined style={IconStyle} />
          <span>Karkuns</span>
        </Menu.Item>
        <Menu.Item key="salary-sheets">
          <DollarOutlined style={IconStyle} />
          <span>Salary Sheets</span>
        </Menu.Item>
        <Menu.Item key="attendance-sheets">
          <SolutionOutlined style={IconStyle} />
          <span>Attendance Sheets</span>
        </Menu.Item>
        <SubMenu
          key="setup"
          title={
            <>
              <LaptopOutlined style={IconStyle} />
              <span>Setup</span>
            </>
          }
        >
          <Menu.Item key="jobs">
            <TagOutlined style={IconStyle} />
            <span>Jobs</span>
          </Menu.Item>
          <Menu.Item key="ms-duties">
            <TagsOutlined style={IconStyle} />
            <span>Duties &amp; Shifts</span>
          </Menu.Item>
          <Menu.Item key="duty-locations">
            <EnvironmentOutlined style={IconStyle} />
            <span>Duty Locations</span>
          </Menu.Item>
        </SubMenu>
        <SubMenu
          key="administration"
          title={
            <>
              <ToolOutlined style={IconStyle} />
              <span>Administration</span>
            </>
          }
        >
          <Menu.Item key="audit-logs">
            <AuditOutlined style={IconStyle} />
            <span>Audit Logs</span>
          </Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar);
export default SidebarContainer;
