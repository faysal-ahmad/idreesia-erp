import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  BookOutlined,
  IdcardOutlined,
  LaptopOutlined,
  MessageOutlined,
  MonitorOutlined,
  ReadOutlined,
  WalletOutlined,
} from '@ant-design/icons';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const { Item, SubMenu } = Menu;

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

      case 'imdad-requests':
        setActiveSubModuleName(SubModuleNames.imdadRequests);
        history.push(paths.imdadRequestsPath);
        break;

      case 'wazaif':
        setActiveSubModuleName(SubModuleNames.wazaif);
        history.push(paths.wazaifPath);
        break;

      case 'messages':
        setActiveSubModuleName(SubModuleNames.messages);
        history.push(paths.messagesPath);
        break;

      case 'imdad-reasons':
        setActiveSubModuleName(SubModuleNames.imdadReasons);
        history.push(paths.imdadReasonsPath);
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
        <Item key="visitors">
          <IdcardOutlined style={IconStyle} />
          <span>Visitors</span>
        </Item>
        <Item key="imdad-requests">
          <WalletOutlined style={IconStyle} />
          <span>Imdad Requests</span>
        </Item>
        <Item key="wazaif">
          <ReadOutlined style={IconStyle} />
          <span>Wazaif</span>
        </Item>
        <Item key="messages">
          <MessageOutlined style={IconStyle} />
          <span>Messages</span>
        </Item>
        <SubMenu
          key="operations-reports"
          title={
            <>
              <BookOutlined style={IconStyle} />
              <span>Reports</span>
            </>
          }
        >
          <Item key="mulakaat-report">
            <span>Mulakaat Report</span>
          </Item>
          <Item key="new-ehad-report">
            <span>New Ehad Report</span>
          </Item>
          <Item key="imdad-request-report">
            <span>Imdad Request Report</span>
          </Item>
        </SubMenu>
        <SubMenu
          key="setup"
          title={
            <>
              <LaptopOutlined style={IconStyle} />
              <span>Setup</span>
            </>
          }
        >
          <Item key="imdad-reasons">
            <MonitorOutlined style={IconStyle} />
            <span>Imdad Reasons</span>
          </Item>
        </SubMenu>
      </Menu>
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar);
export default SidebarContainer;
