import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu, Icon } from '/imports/ui/controls';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const { SubMenu } = Menu;

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
      case 'jobs':
        setActiveSubModuleName(SubModuleNames.jobs);
        history.push(paths.jobsPath);
        break;

      case 'ms-duties':
        setActiveSubModuleName(SubModuleNames.msDuties);
        history.push(paths.msDutiesPath);
        break;

      case 'attendance-sheets':
        setActiveSubModuleName(SubModuleNames.attendanceSheets);
        history.push(paths.attendanceSheetsPath);
        break;

      case 'salary-sheets':
        setActiveSubModuleName(SubModuleNames.salarySheets);
        history.push(paths.salarySheetsPath);
        break;

      case 'duty-locations':
        setActiveSubModuleName(SubModuleNames.dutyLocations);
        history.push(paths.dutyLocationsPath);
        break;

      case 'karkuns':
        setActiveSubModuleName(SubModuleNames.karkuns);
        history.push(paths.karkunsPath);
        break;

      case 'messages':
        setActiveSubModuleName(SubModuleNames.messages);
        history.push(paths.messagesPath);
        break;

      case 'shared-residencs':
        setActiveSubModuleName(SubModuleNames.sharedResidences);
        history.push(paths.sharedResidencesPath);
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
        <Menu.Item key="salary-sheets">
          <span>
            <Icon type="dollar" />
            Salary Sheets
          </span>
        </Menu.Item>
        <Menu.Item key="attendance-sheets">
          <span>
            <Icon type="solution" />
            Attendance Sheets
          </span>
        </Menu.Item>
        <Menu.Item key="messages">
          <span>
            <Icon type="message" />
            Messages
          </span>
        </Menu.Item>
        <Menu.Item key="shared-residencs">
          <span>
            <Icon type="home" />
            Shared Residences
          </span>
        </Menu.Item>
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
          <Menu.Item key="ms-duties">Duties &amp; Shifts</Menu.Item>
          <Menu.Item key="duty-locations">Duty Locations</Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar);
export default SidebarContainer;