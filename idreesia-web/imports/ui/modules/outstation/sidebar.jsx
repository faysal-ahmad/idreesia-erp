import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  AuditOutlined,
  EnvironmentOutlined,
  FileProtectOutlined,
  HomeOutlined,
  LaptopOutlined,
  MessageOutlined,  
  SolutionOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UnlockOutlined,
} from '@ant-design/icons';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

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
      case 'portals':
        setActiveSubModuleName(SubModuleNames.portals);
        history.push(paths.portalsPath);
        break;

      case 'mehfil-duties':
        setActiveSubModuleName(SubModuleNames.mehfilDuties);
        history.push(paths.mehfilDutiesPath);
        break;

      case 'cities':
        setActiveSubModuleName(SubModuleNames.cities);
        history.push(paths.citiesPath);
        break;

      case 'members':
        setActiveSubModuleName(SubModuleNames.members);
        history.push(paths.membersPath);
        break;

      case 'karkuns':
        setActiveSubModuleName(SubModuleNames.karkuns);
        history.push(paths.karkunsPath);
        break;

      case 'attendance-sheets':
        setActiveSubModuleName(SubModuleNames.attendanceSheets);
        history.push(paths.attendanceSheetsPath);
        break;

      case 'messages':
        setActiveSubModuleName(SubModuleNames.messages);
        history.push(paths.messagesPath);
        break;

      case 'outstation-user-accounts':
        setActiveSubModuleName(SubModuleNames.outstationUsers);
        history.push(paths.outstationUsersPath);
        break;

      case 'portal-user-accounts':
        setActiveSubModuleName(SubModuleNames.portalUsers);
        history.push(paths.portalUsersPath);
        break;

      case 'audit-logs':
        setActiveSubModuleName(SubModuleNames.auditLogs);
        history.push(paths.auditLogsPath);
        break;

      case 'security-logs':
        setActiveSubModuleName(SubModuleNames.securityLogs);
        history.push(paths.securityLogsPath);
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
        <Menu.Item key="karkuns">
          <TeamOutlined style={IconStyle} />
          <span>Karkuns</span>
        </Menu.Item>
        <Menu.Item key="members">
          <TeamOutlined style={IconStyle} />
          <span>Members</span>
        </Menu.Item>
        <Menu.Item key="attendance-sheets">
          <SolutionOutlined style={IconStyle} />
          <span>Attendance Sheets</span>
        </Menu.Item>
        <Menu.Item key="messages">
          <MessageOutlined style={IconStyle} />
          <span>Messages</span>
        </Menu.Item>
        <Menu.SubMenu
          key="administration"
          title={
            <>
              <ToolOutlined style={IconStyle} />
              <span>Administration</span>
            </>
          }
        >
          <Menu.Item key="outstation-user-accounts">
            <UnlockOutlined style={IconStyle} />
            <span>Outstation User Accounts</span>
          </Menu.Item>
          <Menu.Item key="portal-user-accounts">
            <UnlockOutlined style={IconStyle} />
            <span>Portal User Accounts</span>
          </Menu.Item>
          <Menu.Item key="audit-logs">
            <AuditOutlined style={IconStyle} />
            <span>Audit Logs</span>
          </Menu.Item>
          <Menu.Item key="security-logs">
            <FileProtectOutlined style={IconStyle} />
            <span>Security Logs</span>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu
          key="setup"
          title={
            <>
              <LaptopOutlined style={IconStyle} />
              <span>Setup</span>
            </>
          }
        >
          <Menu.Item key="portals">
            <HomeOutlined style={IconStyle} />
            <span>Portals</span>
          </Menu.Item>
          <Menu.Item key="cities">
            <EnvironmentOutlined style={IconStyle} />
            <span>Cities &amp; Mehfils</span>
          </Menu.Item>
          <Menu.Item key="mehfil-duties">
            <TagsOutlined style={IconStyle} />
            <span>Mehfil Duties</span>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar);
export default SidebarContainer;
