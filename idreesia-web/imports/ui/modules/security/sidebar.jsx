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

      case 'mulakaat-report':
        setActiveSubModuleName(SubModuleNames.mulakaatReport);
        history.push(paths.mulakaatReportPath);
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
          <span>
            <Icon type="home" style={IconStyle} />
            Shared Residences
          </span>
        </Menu.Item>
        <Menu.SubMenu
          key="mehfil-management"
          title={
            <span>
              <Icon type="flag" style={IconStyle} />
              Mehfil Management
            </span>
          }
        >
          <Menu.Item key="mehfils">
            <span>
              <Icon type="bars" style={IconStyle} />
              Mehfils
            </span>
          </Menu.Item>
          <Menu.Item key="mehfil-card-verification">
            <span>
              <Icon type="barcode" style={IconStyle} />
              Scan Karkun Card
            </span>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu
          key="karkuns"
          title={
            <span>
              <Icon type="team" style={IconStyle} />
              Karkuns
            </span>
          }
        >
          <Menu.Item key="karkun-card-verification">
            <span>
              <Icon type="barcode" style={IconStyle} />
              Card Verification
            </span>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu
          key="visitors"
          title={
            <span>
              <Icon type="team" style={IconStyle} />
              Visitors
            </span>
          }
        >
          <Menu.Item key="visitor-registration">
            <span>
              <Icon type="idcard" style={IconStyle} />
              Registration
            </span>
          </Menu.Item>
          <Menu.Item key="visitor-card-verification">
            <span>
              <Icon type="barcode" style={IconStyle} />
              Card Verification
            </span>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu
          key="security-reports"
          title={
            <span>
              <Icon type="file-search" style={IconStyle} />
              Reports
            </span>
          }
        >
          <Menu.Item key="visitor-stay-report">
            <span>
              <Icon type="book" style={IconStyle} />
              Visitor Stay Report
            </span>
          </Menu.Item>
          <Menu.Item key="team-visit-report">
            <span>
              <Icon type="book" style={IconStyle} />
              Team Visit Report
            </span>
          </Menu.Item>
          <Menu.Item key="mulakaat-report">
            <span>
              <Icon type="book" style={IconStyle} />
              Mulakaat Report
            </span>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu
          key="administration"
          title={
            <span>
              <Icon type="tool" style={IconStyle} />
              Administration
            </span>
          }
        >
          <Menu.Item key="audit-logs">
            <span>
              <Icon type="audit" style={IconStyle} />
              Audit Logs
            </span>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar);
export default SidebarContainer;
