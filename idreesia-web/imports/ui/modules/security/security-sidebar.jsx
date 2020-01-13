import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Icon, Menu } from '/imports/ui/controls';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

class SecuritySidebar extends Component {
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
        <Menu.Item key="mehfils">
          <span>Mehfils</span>
        </Menu.Item>
        <Menu.SubMenu key="karkuns" title={<span>Karkuns</span>}>
          <Menu.Item key="karkun-card-verification">
            <span>
              <Icon type="barcode" />
              Card Verification
            </span>
          </Menu.Item>
        </Menu.SubMenu>
        <Menu.SubMenu key="visitors" title={<span>Visitors</span>}>
          <Menu.Item key="visitor-registration">
            <span>
              <Icon type="idcard" />
              Registration
            </span>
          </Menu.Item>
          <Menu.Item key="visitor-card-verification">
            <span>
              <Icon type="barcode" />
              Card Verification
            </span>
          </Menu.Item>
          <Menu.SubMenu
            key="security-reports"
            title={
              <span>
                <Icon type="book" />
                Reports
              </span>
            }
          >
            <Menu.Item key="visitor-stay-report">
              <span>Visitor Stay Report</span>
            </Menu.Item>
            <Menu.Item key="team-visit-report">
              <span>Team Visit Report</span>
            </Menu.Item>
          </Menu.SubMenu>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

const SecuritySidebarContainer = WithActiveModule()(SecuritySidebar);
export default SecuritySidebarContainer;
