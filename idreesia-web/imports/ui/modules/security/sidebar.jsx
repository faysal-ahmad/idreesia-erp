import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  AuditOutlined,
  BarcodeOutlined,
  BarsOutlined,
  BookOutlined,
  FileSearchOutlined,
  FlagOutlined,
  HomeOutlined,
  IdcardOutlined,
  TeamOutlined,
  ToolOutlined,
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

      case 'mehfil-card-verification':
        setActiveSubModuleName(SubModuleNames.mehfilCardVerification);
        history.push(paths.mehfilCardVerificationPath);
        break;

      case 'karkun-card-verification':
        setActiveSubModuleName(SubModuleNames.karkunCardVerification);
        history.push(paths.karkunCardVerificationPath);
        break;

      case 'shared-residencs':
        setActiveSubModuleName(SubModuleNames.sharedResidences);
        history.push(paths.sharedResidencesPath);
        break;

      case 'visitor-registration':
        setActiveSubModuleName(SubModuleNames.visitorRegistration);
        history.push(paths.visitorRegistrationPath);
        break;

      case 'visitor-card-verification':
        setActiveSubModuleName(SubModuleNames.visitorCardVerification);
        history.push(paths.visitorCardVerificationPath);
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
        <Menu.Item key="shared-residencs">
          <HomeOutlined style={IconStyle} />
          <span>Shared Residences</span>
        </Menu.Item>
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
        </Menu.SubMenu>
        <Menu.SubMenu
          key="security-reports"
          title={
            <>
              <FileSearchOutlined style={IconStyle} />
              <span>Reports</span>
            </>
          }
        >
          <Menu.Item key="visitor-stay-report">
            <BookOutlined style={IconStyle} />
            <span>Visitor Stay Report</span>
          </Menu.Item>
          <Menu.Item key="team-visit-report">
            <BookOutlined style={IconStyle} />
            <span>Team Visit Report</span>
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
