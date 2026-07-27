import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  AuditOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  LaptopOutlined,
  SolutionOutlined,
  TagOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
} from '@ant-design/icons';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const AntMenu = Menu as any;
const AntAuditOutlined = AuditOutlined as any;
const AntDollarOutlined = DollarOutlined as any;
const AntEnvironmentOutlined = EnvironmentOutlined as any;
const AntLaptopOutlined = LaptopOutlined as any;
const AntSolutionOutlined = SolutionOutlined as any;
const AntTagOutlined = TagOutlined as any;
const AntTagsOutlined = TagsOutlined as any;
const AntTeamOutlined = TeamOutlined as any;
const AntToolOutlined = ToolOutlined as any;
interface HistoryLike { push(path: string): void; }
interface SidebarProps { history: HistoryLike; activeModuleName?: string; activeSubModuleName?: string; setActiveSubModuleName(name: string): void; }
interface MenuSelectInfo { key: string; }

const IconStyle = {
  fontSize: '20px',
};

const menuItems = [
  {
    key: 'people',
    icon: <AntTeamOutlined style={IconStyle} />,
    label: 'People',
  },
  {
    key: 'karkuns',
    icon: <AntTeamOutlined style={IconStyle} />,
    label: 'Karkuns',
  },
  {
    key: 'salary-sheets',
    icon: <AntDollarOutlined style={IconStyle} />,
    label: 'Salary Sheets',
  },
  {
    key: 'attendance-sheets',
    icon: <AntSolutionOutlined style={IconStyle} />,
    label: 'Attendance Sheets',
  },
  {
    key: 'setup',
    icon: <AntLaptopOutlined style={IconStyle} />,
    label: 'Setup',
    children: [
      {
        key: 'jobs',
        icon: <AntTagOutlined style={IconStyle} />,
        label: 'Jobs',
      },
      {
        key: 'ms-duties',
        icon: <AntTagsOutlined style={IconStyle} />,
        label: 'Duties & Shifts',
      },
      {
        key: 'duty-locations',
        icon: <AntEnvironmentOutlined style={IconStyle} />,
        label: 'Duty Locations',
      },
    ],
  },
  {
    key: 'administration',
    icon: <AntToolOutlined style={IconStyle} />,
    label: 'Administration',
    children: [
      {
        key: 'audit-logs',
        icon: <AntAuditOutlined style={IconStyle} />,
        label: 'Audit Logs',
      },
    ],
  },
];

class Sidebar extends Component<SidebarProps> {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
  };

  handleMenuItemSelected = ({ key }: MenuSelectInfo) => {
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

      case 'people':
        setActiveSubModuleName(SubModuleNames.people);
        history.push(paths.peoplePath);
        break;

      case 'audit-logs':
        setActiveSubModuleName(SubModuleNames.auditLogs);
        history.push(paths.auditLogsPath);
        break;

      default:
        break;
    }
  };

  render() {
    return (
      <AntMenu
        mode="inline"
        style={{ height: '100%', borderRight: 0 }}
        onClick={this.handleMenuItemSelected}
        items={menuItems}
      />
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar as any);
export default SidebarContainer;
