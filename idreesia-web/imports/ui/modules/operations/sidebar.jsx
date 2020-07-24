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
      case 'visitors':
        setActiveSubModuleName(SubModuleNames.visitors);
        history.push(paths.visitorsPath);
        break;

      case 'wazaif':
        setActiveSubModuleName(SubModuleNames.wazaif);
        history.push(paths.wazaifPath);
        break;

      case 'messages':
        setActiveSubModuleName(SubModuleNames.messages);
        history.push(paths.messagesPath);
        break;

      case 'new-ehad-report':
        setActiveSubModuleName(SubModuleNames.newEhadReport);
        history.push(paths.newEhadReportPath);
        break;

      case 'mulakaat-report':
        setActiveSubModuleName(SubModuleNames.mulakaatReport);
        history.push(paths.mulakaatReportPath);
        break;

      case 'imdad-request-report':
        setActiveSubModuleName(SubModuleNames.imdadRequestReport);
        history.push(paths.imdadRequestReportPath);
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
        <Menu.Item key="visitors">
          <span>
            <Icon type="idcard" style={IconStyle} />
            Visitors
          </span>
        </Menu.Item>
        <Menu.Item key="wazaif">
          <span>
            <Icon type="read" style={IconStyle} />
            Wazaif
          </span>
        </Menu.Item>
        <Menu.Item key="messages">
          <span>
            <Icon type="message" style={IconStyle} />
            Messages
          </span>
        </Menu.Item>
        <Menu.SubMenu
          key="operations-reports"
          title={
            <span>
              <Icon type="book" style={IconStyle} />
              Reports
            </span>
          }
        >
          <Menu.Item key="mulakaat-report">
            <span>Mulakaat Report</span>
          </Menu.Item>
          <Menu.Item key="new-ehad-report">
            <span>New Ehad Report</span>
          </Menu.Item>
          <Menu.Item key="imdad-request-report">
            <span>Imdad Request Report</span>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar);
export default SidebarContainer;