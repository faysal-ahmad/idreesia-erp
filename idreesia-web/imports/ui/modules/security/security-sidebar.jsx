import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { Icon, Menu } from '/imports/ui/controls';
import { GlobalActionsCreator } from '/imports/ui/action-creators';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

class SecuritySidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
  };

  handleMenuItemSelected = ({ key }) => {
    const { history, setActiveSubModuleName } = this.props;
    switch (key) {
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

      default:
        break;
    }
  };

  render() {
    return (
      <Menu
        mode="inline"
        defaultSelectedKeys={['home']}
        style={{ height: '100%', borderRight: 0 }}
        onClick={this.handleMenuItemSelected}
      >
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
          <Menu.Item key="visitor-stay-report">
            <span>
              <Icon type="solution" />
              Stay Report
            </span>
          </Menu.Item>
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

const SecuritySidebarContainer = connect(
  null,
  mapDispatchToProps
)(SecuritySidebar);
export default SecuritySidebarContainer;
