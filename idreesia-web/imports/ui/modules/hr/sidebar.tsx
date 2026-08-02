import React, { type CSSProperties } from 'react';
import { type History } from 'history';
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

import { useActiveModule } from 'meteor/idreesia-common/hooks/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const IconStyle: CSSProperties = {
  fontSize: '20px',
};

const menuItems = [
  {
    key: 'people',
    icon: <TeamOutlined style={IconStyle} />,
    label: 'People',
  },
  {
    key: 'karkuns',
    icon: <TeamOutlined style={IconStyle} />,
    label: 'Karkuns',
  },
  {
    key: 'salary-sheets',
    icon: <DollarOutlined style={IconStyle} />,
    label: 'Salary Sheets',
  },
  {
    key: 'attendance-sheets',
    icon: <SolutionOutlined style={IconStyle} />,
    label: 'Attendance Sheets',
  },
  {
    key: 'setup',
    icon: <LaptopOutlined style={IconStyle} />,
    label: 'Setup',
    children: [
      {
        key: 'jobs',
        icon: <TagOutlined style={IconStyle} />,
        label: 'Jobs',
      },
      {
        key: 'ms-duties',
        icon: <TagsOutlined style={IconStyle} />,
        label: 'Duties & Shifts',
      },
      {
        key: 'duty-locations',
        icon: <EnvironmentOutlined style={IconStyle} />,
        label: 'Duty Locations',
      },
    ],
  },
  {
    key: 'administration',
    icon: <ToolOutlined style={IconStyle} />,
    label: 'Administration',
    children: [
      {
        key: 'audit-logs',
        icon: <AuditOutlined style={IconStyle} />,
        label: 'Audit Logs',
      },
    ],
  },
];

interface SidebarProps {
  history: History;
}

interface MenuSelectInfo {
  key: string;
}

const Sidebar = ({ history }: SidebarProps) => {
  const { setActiveSubModuleName } = useActiveModule();

  const handleMenuItemSelected = ({ key }: MenuSelectInfo) => {
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

  return (
    <Menu
      mode="inline"
      style={{ height: '100%', borderRight: 0 }}
      onClick={handleMenuItemSelected}
      items={menuItems}
    />
  );
};

export default Sidebar;
