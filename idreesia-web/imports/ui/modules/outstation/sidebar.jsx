import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Icon, Menu } from '/imports/ui/controls';
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

      case 'portal-user-accounts':
        setActiveSubModuleName(SubModuleNames.portalUsers);
        history.push(paths.portalUsersPath);
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
        <Menu.Item key="karkuns">
          <span>
            <Icon type="team" style={IconStyle} />
            Karkuns
          </span>
        </Menu.Item>
        <Menu.Item key="members">
          <span>
            <Icon type="team" style={IconStyle} />
            Members
          </span>
        </Menu.Item>
        <Menu.Item key="attendance-sheets">
          <span>
            <Icon type="solution" style={IconStyle} />
            Attendance Sheets
          </span>
        </Menu.Item>
        <Menu.Item key="messages">
          <span>
            <Icon type="message" style={IconStyle} />
            Messages
          </span>
        </Menu.Item>
        <Menu.SubMenu
          key="administration"
          title={
            <span>
              <Icon type="tool" style={IconStyle} />
              Administration
            </span>
          }
        >
          <Menu.Item key="portal-user-accounts">
            <span>
              <Icon type="unlock" style={IconStyle} />
              Portal User Accounts
            </span>
          </Menu.Item>
          <Menu.Item key="audit-logs">
            <span>
              <Icon type="audit" style={IconStyle} />
              Audit Logs
            </span>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu
          key="setup"
          title={
            <span>
              <Icon type="laptop" style={IconStyle} />
              Setup
            </span>
          }
        >
          <Menu.Item key="portals">
            <span>
              <Icon type="home" style={IconStyle} />
              Portals
            </span>
          </Menu.Item>
          <Menu.Item key="cities">
            <span>
              <Icon type="environment" style={IconStyle} />
              Cities &amp; Mehfils
            </span>
          </Menu.Item>
          <Menu.Item key="mehfil-duties">
            <span>
              <Icon type="tags" style={IconStyle} />
              Mehfil Duties
            </span>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar);
export default SidebarContainer;
