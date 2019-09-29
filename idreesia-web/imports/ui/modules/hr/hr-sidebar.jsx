import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu, Icon } from '/imports/ui/controls';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const { SubMenu } = Menu;

class HRSidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
  };

  handleMenuItemSelected = ({ key }) => {
    const { history, setActiveSubModuleName } = this.props;

    switch (key) {
      case 'jobs':
        setActiveSubModuleName(SubModuleNames.jobs);
        history.push(paths.jobsPath);
        break;

      case 'duties':
        setActiveSubModuleName(SubModuleNames.duties);
        history.push(paths.dutiesPath);
        break;

      case 'attendance-sheets':
        setActiveSubModuleName(SubModuleNames.attendanceSheets);
        history.push(paths.attendanceSheetsPath);
        break;

      case 'duty-shifts':
        setActiveSubModuleName(SubModuleNames.dutyShifts);
        history.push(paths.dutyShiftsPath);
        break;

      case 'duty-locations':
        setActiveSubModuleName(SubModuleNames.dutyLocations);
        history.push(paths.dutyLocationsPath);
        break;

      case 'karkuns':
        setActiveSubModuleName(SubModuleNames.karkuns);
        history.push(paths.karkunsPath);
        break;

      case 'shared-residencs':
        setActiveSubModuleName(SubModuleNames.sharedResidences);
        history.push(paths.sharedResidencesPath);
        break;

      case 'karkuns-search':
        setActiveSubModuleName(SubModuleNames.karkuns);
        history.push(paths.karkunsSearchPath);
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
        <Menu.Item key="karkuns">Karkuns</Menu.Item>
        <Menu.Item key="attendance-sheets">Attendance Sheets</Menu.Item>
        <Menu.Item key="shared-residencs">Shared Residences</Menu.Item>
        <SubMenu
          key="setup"
          title={
            <span>
              <Icon type="laptop" />
              Setup
            </span>
          }
        >
          <Menu.Item key="jobs">Jobs</Menu.Item>
          <Menu.Item key="duties">Duties</Menu.Item>
          <Menu.Item key="duty-shifts">Duty Shifts</Menu.Item>
          <Menu.Item key="duty-locations">Duty Locations</Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}

const HRSidebarContainer = WithActiveModule()(HRSidebar);
export default HRSidebarContainer;
