import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Icon, Menu } from '/imports/ui/controls';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

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
        <Menu.Item key="visitors">
          <span>
            <Icon type="idcard" />
            Visitors
          </span>
        </Menu.Item>
        <Menu.SubMenu
          key="telephone-room-reports"
          title={
            <span>
              <Icon type="book" />
              Reports
            </span>
          }
        >
          <Menu.Item key="mulakaat-report">
            <span>Mulakaat Report</span>
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar);
export default SidebarContainer;
