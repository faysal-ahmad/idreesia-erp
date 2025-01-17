import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  AuditOutlined,
  BarcodeOutlined,
  BarsOutlined,
  BookOutlined,
  FlagOutlined,
  IdcardOutlined,
  LaptopOutlined,
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
      case 'mehfils':
        setActiveSubModuleName(SubModuleNames.mehfils);
        history.push(paths.mehfilsPath);
        break;

      case 'mehfil-duties':
        setActiveSubModuleName(SubModuleNames.mehfilDuties);
        history.push(paths.mehfilDutiesPath);
        break;

      case 'mehfil-langar-dishes':
        setActiveSubModuleName(SubModuleNames.mehfilLangarDishes);
        history.push(paths.mehfilLangarDishesPath);
        break;

      case 'mehfil-langar-locations':
        setActiveSubModuleName(SubModuleNames.mehfilLangarLocations);
        history.push(paths.mehfilLangarLocationsPath);
        break;
    
      case 'mehfil-card-verification':
        setActiveSubModuleName(SubModuleNames.mehfilCardVerification);
        history.push(paths.mehfilCardVerificationPath);
        break;

      case 'karkun-card-verification':
        setActiveSubModuleName(SubModuleNames.karkunCardVerification);
        history.push(paths.karkunCardVerificationPath);
        break;

      case 'visitor-registration':
        setActiveSubModuleName(SubModuleNames.visitorRegistration);
        history.push(paths.visitorRegistrationPath);
        break;

      case 'visitor-card-verification':
        setActiveSubModuleName(SubModuleNames.visitorCardVerification);
        history.push(paths.visitorCardVerificationPath);
        break;

      case 'security-user-accounts':
        setActiveSubModuleName(SubModuleNames.securityUsers);
        history.push(paths.securityUsersPath);
        break;
  
      case 'audit-logs':
        setActiveSubModuleName(SubModuleNames.auditLogs);
        history.push(paths.auditLogsPath);
        break;

      case 'visitor-stay-report':
        setActiveSubModuleName(SubModuleNames.visitorStayReport);
        history.push(paths.visitorStayReportPath);
        break;

      case 'team-visit-report':
        setActiveSubModuleName(SubModuleNames.teamVisitReport);
        history.push(paths.teamVisitReportPath);
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
        <Menu.SubMenu
          key="mehfil-management"
          title={
            <>
              <FlagOutlined style={IconStyle} />
              <span>Mehfil Management</span>
            </>
          }
        >
          <Menu.Item key="mehfils">
            <BarsOutlined style={IconStyle} />
            <span>Mehfils</span>
          </Menu.Item>
          <Menu.Item key="mehfil-card-verification">
            <BarcodeOutlined style={IconStyle} />
            <span>Scan Karkun Card</span>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu
          key="karkuns"
          title={
            <>
              <TeamOutlined style={IconStyle} />
              <span>Karkuns</span>
            </>
          }
        >
          <Menu.Item key="karkun-card-verification">
            <BarcodeOutlined style={IconStyle} />
            <span>Card Verification</span>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu
          key="visitors"
          title={
            <>
              <TeamOutlined style={IconStyle} />
              <span>Visitors</span>
            </>
          }
        >
          <Menu.Item key="visitor-registration">
            <IdcardOutlined style={IconStyle} />
            <span>Registration</span>
          </Menu.Item>
          <Menu.Item key="visitor-card-verification">
            <BarcodeOutlined style={IconStyle} />
            <span>Card Verification</span>
          </Menu.Item>
          <Menu.Item key="visitor-stay-report">
            <BookOutlined style={IconStyle} />
            <span>Visitor Stay Report</span>
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
          <Menu.Item key="mehfil-duties">
            <TagsOutlined style={IconStyle} />
            <span>Mehfil Duties</span>
          </Menu.Item>
          <Menu.Item key="mehfil-langar-dishes">
            <TagsOutlined style={IconStyle} />
            <span>Langar Dishes</span>
          </Menu.Item>
          <Menu.Item key="mehfil-langar-locations">
            <TagsOutlined style={IconStyle} />
            <span>Langar Locations</span>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu
          key="administration"
          title={
            <>
              <ToolOutlined style={IconStyle} />
              <span>Administration</span>
            </>
          }
        >
          <Menu.Item key="security-user-accounts">
            <UnlockOutlined style={IconStyle} />
            <span>Security User Accounts</span>
          </Menu.Item>
          <Menu.Item key="audit-logs">
            <AuditOutlined style={IconStyle} />
            <span>Audit Logs</span>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar);
export default SidebarContainer;
