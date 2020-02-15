import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Icon, Menu } from '/imports/ui/controls';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

class OutstationSidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
  };

  handleMenuItemSelected = ({ key }) => {
    const { history, setActiveSubModuleName } = this.props;

    switch (key) {
      case 'mehfil-duties':
        setActiveSubModuleName(SubModuleNames.mehfilDuties);
        history.push(paths.mehfilDutiesPath);
        break;

      case 'cities':
        setActiveSubModuleName(SubModuleNames.cities);
        history.push(paths.citiesPath);
        break;

      case 'karkuns':
        setActiveSubModuleName(SubModuleNames.karkuns);
        history.push(paths.karkunsPath);
        break;

      case 'attendance-sheets':
        setActiveSubModuleName(SubModuleNames.attendanceSheets);
        history.push(paths.attendanceSheetsPath);
        break;

      case 'amaanat-logs':
        setActiveSubModuleName(SubModuleNames.amaanatLogs);
        history.push(paths.amaanatLogsPath);
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
            <Icon type="team" />
            Karkuns
          </span>
        </Menu.Item>
        <Menu.Item key="attendance-sheets">
          <span>
            <Icon type="solution" />
            Attendance Sheets
          </span>
        </Menu.Item>
        <Menu.Item key="amaanat-logs">
          <span>
            <Icon type="red-envelope" />
            Amaanat Logs
          </span>
        </Menu.Item>
        <Menu.SubMenu
          key="setup"
          title={
            <span>
              <Icon type="laptop" />
              Setup
            </span>
          }
        >
          <Menu.Item key="cities">Cities &amp; Mehfils</Menu.Item>
          <Menu.Item key="mehfil-duties">Mehfil Duties</Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );
  }
}

const OutstationSidebarContainer = WithActiveModule()(OutstationSidebar);
export default OutstationSidebarContainer;
