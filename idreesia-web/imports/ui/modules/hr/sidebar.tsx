import React, {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { type History } from 'history';
import {
  AuditOutlined,
  ClusterOutlined,
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
    key: 'employee-management',
    icon: <ClusterOutlined style={IconStyle} />,
    label: 'Employee Management',
    children: [
      {
        key: 'employees',
        icon: <TeamOutlined style={IconStyle} />,
        label: 'Employees',
      },
      {
        key: 'salary-sheets',
        icon: <DollarOutlined style={IconStyle} />,
        label: 'Salary Sheets',
      },
      {
        key: 'employee-setup',
        icon: <LaptopOutlined style={IconStyle} />,
        label: 'Setup',
        children: [
          {
            key: 'jobs',
            icon: <TagOutlined style={IconStyle} />,
            label: 'Jobs',
          },
        ],
      },
    ],
  },
  {
    key: 'karkuns-management',
    icon: <ClusterOutlined style={IconStyle} />,
    label: 'Karkuns Management',
    children: [
      {
        key: 'karkuns',
        icon: <TeamOutlined style={IconStyle} />,
        label: 'Karkuns',
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

interface MenuClickInfo {
  key: string;
}

interface MenuRouteMatch {
  key: string;
  openKeys: string[];
  subModuleName: string;
  matches: (pathname: string) => boolean;
}

const isPath = (pathname: string, basePath: string) =>
  pathname === basePath || pathname.startsWith(`${basePath}/`);

const menuRouteMatches: MenuRouteMatch[] = [
  {
    key: 'employees',
    openKeys: ['employee-management'],
    subModuleName: SubModuleNames.employees,
    matches: pathname => isPath(pathname, paths.employeesPath),
  },
  {
    key: 'salary-sheets',
    openKeys: ['employee-management'],
    subModuleName: SubModuleNames.salarySheets,
    matches: pathname => isPath(pathname, paths.salarySheetsPath),
  },
  {
    key: 'karkuns',
    openKeys: ['karkuns-management'],
    subModuleName: SubModuleNames.karkuns,
    matches: pathname => isPath(pathname, paths.karkunsPath),
  },
  {
    key: 'attendance-sheets',
    openKeys: ['karkuns-management'],
    subModuleName: SubModuleNames.attendanceSheets,
    matches: pathname => isPath(pathname, paths.attendanceSheetsPath),
  },
  {
    key: 'jobs',
    openKeys: ['employee-management', 'employee-setup'],
    subModuleName: SubModuleNames.jobs,
    matches: pathname => isPath(pathname, paths.jobsPath),
  },
  {
    key: 'ms-duties',
    openKeys: ['karkuns-management', 'setup'],
    subModuleName: SubModuleNames.msDuties,
    matches: pathname => isPath(pathname, paths.msDutiesPath),
  },
  {
    key: 'duty-locations',
    openKeys: ['karkuns-management', 'setup'],
    subModuleName: SubModuleNames.dutyLocations,
    matches: pathname => isPath(pathname, paths.dutyLocationsPath),
  },
  {
    key: 'audit-logs',
    openKeys: ['administration'],
    subModuleName: SubModuleNames.auditLogs,
    matches: pathname => isPath(pathname, paths.auditLogsPath),
  },
];

const resolveMenuFromPath = (pathname: string): MenuRouteMatch | null =>
  menuRouteMatches.find(entry => entry.matches(pathname)) ?? null;

const sameKeySet = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every(key => setB.has(key));
};

const Sidebar = ({ history }: SidebarProps) => {
  const { activeSubModuleName, setActiveSubModuleName } = useActiveModule();
  const [pathname, setPathname] = useState(history.location.pathname);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const unlisten = history.listen(location => {
      setPathname(location.pathname);
    });
    return unlisten;
  }, [history]);

  const activeMenu = useMemo(
    () => resolveMenuFromPath(pathname),
    [pathname]
  );

  useEffect(() => {
    if (!activeMenu) return;

    if (activeSubModuleName !== activeMenu.subModuleName) {
      setActiveSubModuleName(activeMenu.subModuleName);
    }

    setOpenKeys(prev => {
      const merged = Array.from(new Set([...prev, ...activeMenu.openKeys]));
      return sameKeySet(prev, merged) ? prev : merged;
    });
  }, [activeMenu, activeSubModuleName, setActiveSubModuleName]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(prev => (sameKeySet(prev, keys) ? prev : keys));
  };

  const handleMenuItemSelected = ({ key }: MenuClickInfo) => {
    switch (key) {
      case 'jobs':
        history.push(paths.jobsPath);
        break;

      case 'ms-duties':
        history.push(paths.msDutiesPath);
        break;

      case 'attendance-sheets':
        history.push(paths.attendanceSheetsPath);
        break;

      case 'salary-sheets':
        history.push(paths.salarySheetsPath);
        break;

      case 'duty-locations':
        history.push(paths.dutyLocationsPath);
        break;

      case 'karkuns':
        history.push(paths.karkunsPath);
        break;

      case 'employees':
        history.push(paths.employeesPath);
        break;

      case 'audit-logs':
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
      selectedKeys={activeMenu ? [activeMenu.key] : []}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
      onClick={handleMenuItemSelected}
      items={menuItems}
    />
  );
};

export default Sidebar;
